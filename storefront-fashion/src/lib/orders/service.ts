import { sanitizeLines } from '@/lib/cart/storage'
import { computeTotals } from '@/lib/cart/totals'
import { lineKey, type CartLine } from '@/lib/cart/types'
import { evaluateCoupon } from '@/lib/coupons/evaluate'
import type { Mutation } from '@/lib/storage/collection'
import { generateOrderCode } from './code'
import { resolveRecipient, saveRecipient, type RecipientDeps } from './recipient'
import { couponUsageIn, type OrderRepository } from './repository'
import { MESSAGES, parseOrderInput, type Order, type PublicOrder } from './schema'

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; fields: Record<string, string> }

export interface PlaceOrderDeps extends RecipientDeps {
  readonly repo: OrderRepository
  readonly now: () => Date
}

interface Pricing {
  readonly couponCode?: string
  readonly discount: number
  readonly shipping: number
}

type PricingResult = { ok: true; pricing: Pricing } | { ok: false; fields: Record<string, string> }

interface Placement {
  readonly customer: Order['customer']
  readonly payment: Order['payment']
  readonly lines: readonly CartLine[]
  readonly couponCode?: string
  readonly userId?: string
  readonly now: Date
}

const LINES_ERROR: PlaceOrderResult = { ok: false, fields: { lines: MESSAGES.lines } }

function fieldKey(path: readonly PropertyKey[]): string {
  if (path.length === 0 || path[0] === 'lines') return 'lines'
  return path.map(String).join('.')
}

function toFields(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  return issues.reduce<Record<string, string>>((fields, issue) => {
    const key = fieldKey(issue.path)
    return key in fields ? fields : { ...fields, [key]: issue.message }
  }, {})
}

/** True only when sanitizeLines keeps every line exactly as sent (same order, keys and quantities). */
function survivesSanitize(lines: readonly CartLine[]): boolean {
  const clean = sanitizeLines(lines)
  return (
    clean.length === lines.length &&
    clean.every((line, i) => lineKey(line) === lineKey(lines[i]) && line.quantity === lines[i].quantity)
  )
}

function priceWithCoupon(orders: readonly Order[], totals: { subtotal: number; shipping: number }, placement: Placement): PricingResult {
  const { couponCode: code, userId, now } = placement
  if (code === undefined) return { ok: true, pricing: { discount: 0, shipping: totals.shipping } }
  const usage = couponUsageIn(orders, code, userId)
  const result = evaluateCoupon(code, {
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    now,
    signedIn: userId !== undefined,
    usedCount: usage.total,
    usedByUser: usage.byUser,
  })
  if (!result.ok) return { ok: false, fields: { couponCode: result.message } }
  return { ok: true, pricing: { couponCode: result.coupon.code, discount: result.discount, shipping: result.shipping } }
}

/** Runs under the orders file lock, so coupon limits are checked against every order already stored. */
function decidePlacement(orders: readonly Order[], placement: Placement): Mutation<Order, PlaceOrderResult> {
  const totals = computeTotals(placement.lines)
  const priced = priceWithCoupon(orders, totals, placement)
  if (!priced.ok) return { writes: [], result: priced }
  const order = buildOrder(placement, totals, priced.pricing)
  return { writes: [order], result: { ok: true, order } }
}

export async function placeOrder(input: unknown, deps: PlaceOrderDeps): Promise<PlaceOrderResult> {
  const parsed = parseOrderInput(input)
  if (!parsed.success) return { ok: false, fields: toFields(parsed.error.issues) }
  const data = parsed.data
  if (!survivesSanitize(data.lines)) return LINES_ERROR
  const recipient = await resolveRecipient(data, deps)
  if (!recipient.ok) return recipient

  const placement: Placement = { ...data, customer: recipient.customer, userId: deps.userId, now: deps.now() }
  const result = await deps.repo.mutate((orders) => decidePlacement(orders, placement))
  if (result.ok && data.addressId === undefined && data.saveAddress === true) await saveRecipient(recipient.customer, deps)
  return result
}

function buildOrder({ customer, payment, userId, now }: Placement, totals: ReturnType<typeof computeTotals>, pricing: Pricing): Order {
  const code = generateOrderCode(now)
  const createdAt = now.toISOString()
  return {
    id: code,
    code,
    createdAt,
    ...(userId === undefined ? {} : { userId }),
    status: 'pending',
    statusHistory: [{ status: 'pending', at: createdAt }],
    customer,
    payment,
    lines: totals.lines.map((line) => ({
      productId: line.productId,
      name: line.product.name,
      size: line.size,
      color: line.color,
      quantity: line.quantity,
      unitPrice: line.product.price,
      lineTotal: line.lineTotal,
    })),
    subtotal: totals.subtotal,
    discount: pricing.discount,
    ...(pricing.couponCode === undefined ? {} : { couponCode: pricing.couponCode }),
    shipping: pricing.shipping,
    total: Math.max(0, totals.subtotal - pricing.discount) + pricing.shipping,
  }
}

/** Strips the recipient and the owner id, for the public success page. */
export function toPublicOrder(order: Order): PublicOrder {
  const { customer: _customer, userId: _userId, ...publicOrder } = order
  void _customer
  void _userId
  return publicOrder
}
