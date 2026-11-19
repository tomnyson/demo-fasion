import { ORDER_CODE_PATTERN } from './code'
import type { OrderRepository } from './repository'
import type { Order } from './schema'

/** The order if it belongs to `userId`; malformed, unknown, guest and foreign codes all give `null`. */
export async function findOwnOrder(repo: OrderRepository, userId: string, code: string): Promise<Order | null> {
  if (!ORDER_CODE_PATTERN.test(code)) return null
  const order = await repo.findByCode(code)
  return order !== null && order.userId === userId ? order : null
}
