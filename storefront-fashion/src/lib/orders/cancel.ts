import type { Order } from './schema'
import type { OrderRepository, StatusGuard } from './repository'
import { CANCEL_BLOCKED_MESSAGES, canCustomerCancel } from './status'

export const ORDER_NOT_FOUND = 'Không tìm thấy đơn hàng.'

export type CancelResult =
  | { readonly ok: true; readonly order: Order }
  | { readonly ok: false; readonly reason: 'not_found' }
  | { readonly ok: false; readonly reason: 'conflict'; readonly message: string }

/** Someone else's order looks exactly like a missing one. */
const ownPendingOnly =
  (userId: string): StatusGuard =>
  (order) => {
    if (order.userId !== userId) return 'not_found'
    return canCustomerCancel(order) ? null : 'not_allowed'
  }

const blockedMessage = (order: Order): string =>
  order.status === 'pending' ? CANCEL_BLOCKED_MESSAGES.cancelled : CANCEL_BLOCKED_MESSAGES[order.status]

/** Customer cancel (A5): only their own order, only while pending. Parallel calls cancel once. */
export async function cancelOrderForUser(repo: OrderRepository, userId: string, code: string, now: Date): Promise<CancelResult> {
  const result = await repo.updateStatus(code, 'cancelled', now, ownPendingOnly(userId))
  if (result.ok) return result
  if (result.reason === 'not_found') return { ok: false, reason: 'not_found' }
  return { ok: false, reason: 'conflict', message: blockedMessage(result.order) }
}
