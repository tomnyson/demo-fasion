import { sanitizeLines } from '@/lib/cart/storage'
import { computeTotals } from '@/lib/cart/totals'
import { lineKey, type CartLine } from '@/lib/cart/types'
import { generateOrderCode } from './code'
import type { OrderRepository } from './repository'
import { MESSAGES, orderInputSchema, type Order, type PublicOrder } from './schema'

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; fields: Record<string, string> }

interface PlaceOrderDeps {
  readonly repo: OrderRepository
  readonly now: () => Date
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

export async function placeOrder(input: unknown, deps: PlaceOrderDeps): Promise<PlaceOrderResult> {
  const parsed = orderInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, fields: toFields(parsed.error.issues) }
  const { customer, payment, lines } = parsed.data
  if (!survivesSanitize(lines)) return LINES_ERROR

  const totals = computeTotals(lines)
  const now = deps.now()
  const order: Order = {
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
    shipping: totals.shipping,
    total: totals.total,
  }
  await deps.repo.create(order)
  return { ok: true, order }
}

export function toPublicOrder(order: Order): PublicOrder {
  const { customer: _customer, ...publicOrder } = order
  void _customer
  return publicOrder
}
