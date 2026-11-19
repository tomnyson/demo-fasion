import { sanitizeLines } from '@/lib/cart/storage'
import { computeTotals } from '@/lib/cart/totals'
import { lineKey, type CartLine } from '@/lib/cart/types'
import { evaluateCoupon } from '@/lib/coupons/evaluate'
import { withLock } from '@/lib/storage/lock'
import { generateOrderCode } from './code'
import type { OrderRepository } from './repository'
import { MESSAGES, orderInputSchema, type Order, type PublicOrder } from './schema'

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; fields: Record<string, string> }

interface PlaceOrderDeps {
  readonly repo: OrderRepository
  readonly now: () => Date
  /** Set when the customer is signed in; enables member-only coupons. */
  readonly userId?: string
}

interface Pricing {
  readonly couponCode?: string
  readonly discount: number
  readonly shipping: number
}

type PricingResult = { ok: true; pricing: Pricing } | { ok: false; fields: Record<string, string> }

/** The order is placed under this lock, so a coupon's usage limit cannot be overrun by parallel orders. */
const ORDERS_LOCK = 'orders'

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

async function priceWithCoupon(
  code: string | undefined,
  totals: { subtotal: number; shipping: number },
  deps: PlaceOrderDeps,
  now: Date,
): Promise<PricingResult> {
  if (code === undefined) return { ok: true, pricing: { discount: 0, shipping: totals.shipping } }
  const result = evaluateCoupon(code, {
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    now,
    signedIn: deps.userId !== undefined,
    usedCount: await deps.repo.countByCoupon(code),
  })
  if (!result.ok) return { ok: false, fields: { couponCode: result.message } }
  return { ok: true, pricing: { couponCode: result.coupon.code, discount: result.discount, shipping: result.shipping } }
}

export async function placeOrder(input: unknown, deps: PlaceOrderDeps): Promise<PlaceOrderResult> {
  const parsed = orderInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, fields: toFields(parsed.error.issues) }
  const { customer, payment, lines, couponCode } = parsed.data
  if (!survivesSanitize(lines)) return LINES_ERROR

  return withLock(ORDERS_LOCK, async () => {
    const now = deps.now()
    const totals = computeTotals(lines)
    const priced = await priceWithCoupon(couponCode, totals, deps, now)
    if (!priced.ok) return priced
    const { pricing } = priced
    const order = buildOrder({ customer, payment, totals, pricing, now })
    await deps.repo.create(order)
    return { ok: true, order }
  })
}

interface BuildOrderInput {
  readonly customer: Order['customer']
  readonly payment: Order['payment']
  readonly totals: ReturnType<typeof computeTotals>
  readonly pricing: Pricing
  readonly now: Date
}

function buildOrder({ customer, payment, totals, pricing, now }: BuildOrderInput): Order {
  return {
    code: generateOrderCode(now),
    createdAt: now.toISOString(),
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

export function toPublicOrder(order: Order): PublicOrder {
  const { customer: _customer, ...publicOrder } = order
  void _customer
  return publicOrder
}
