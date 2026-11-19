import { createCollection, type Mutation, type Tombstone } from '@/lib/storage/collection'
import { dataPath } from '@/lib/storage/jsonl-store'
import { normalizeOrder } from './normalize'
import type { Order } from './schema'
import { canTransition, type OrderStatus } from './status'

/** Live (not cancelled) orders using a coupon: all customers, and the given customer (A4). */
export interface CouponUsage {
  readonly total: number
  readonly byUser: number
}

/**
 * Why a status change was refused: the order is unknown (or the guard hides it), the transition is
 * not in the A5 table, or the guard forbids it for this caller.
 */
export type StatusRejection = 'not_found' | 'invalid_transition' | 'not_allowed'

/** Extra check run under the lock; return a rejection to stop the change. */
export type StatusGuard = (order: Order) => StatusRejection | null

export type StatusUpdateResult =
  | { readonly ok: true; readonly order: Order }
  | { readonly ok: false; readonly reason: 'not_found' }
  | { readonly ok: false; readonly reason: 'invalid_transition' | 'not_allowed'; readonly order: Order }

export interface OrderRepository {
  create(order: Order): Promise<void>
  findByCode(code: string): Promise<Order | null>
  /** The user's orders, newest first. */
  listForUser(userId: string): Promise<readonly Order[]>
  couponUsage(code: string, userId?: string): Promise<CouponUsage>
  /** Reads every order and appends what `decide` returns, all under the orders file lock. `decide` is synchronous. */
  mutate<R>(decide: (orders: readonly Order[]) => Mutation<Order, R>): Promise<R>
  /** Moves an order to `next` if the A5 table and `guard` allow it; parallel calls apply at most once. */
  updateStatus(code: string, next: OrderStatus, now: Date, guard?: StatusGuard): Promise<StatusUpdateResult>
}

export const ORDERS_FILE = 'orders.jsonl'

const newestFirst = (a: Order, b: Order): number => b.createdAt.localeCompare(a.createdAt)

/** Counts from the merged latest state, so a cancelled order gives its use back. */
export function couponUsageIn(orders: readonly Order[], code: string, userId?: string): CouponUsage {
  const live = orders.filter((order) => order.couponCode === code && order.status !== 'cancelled')
  return { total: live.length, byUser: userId === undefined ? 0 : live.filter((order) => order.userId === userId).length }
}

const unchanged = <R>(result: R): Mutation<Order, R> => ({ writes: [], result })

function decideStatus(orders: readonly Order[], code: string, next: OrderStatus, now: Date, guard?: StatusGuard): Mutation<Order, StatusUpdateResult> {
  const order = orders.find((candidate) => candidate.code === code)
  if (order === undefined) return unchanged({ ok: false, reason: 'not_found' })
  const rejection = guard?.(order) ?? (canTransition(order.status, next) ? null : 'invalid_transition')
  if (rejection === 'not_found') return unchanged({ ok: false, reason: 'not_found' })
  if (rejection !== null) return unchanged({ ok: false, reason: rejection, order })
  const updated: Order = { ...order, status: next, statusHistory: [...order.statusHistory, { status: next, at: now.toISOString() }] }
  return { writes: [updated], result: { ok: true, order: updated } }
}

const normalizeLine = (raw: unknown): Order | Tombstone | null => normalizeOrder(raw)

/** Orders on an append-only collection; legacy lines (no id/status) are upgraded on read. */
export function createFileOrderRepository(filePath: string = dataPath(ORDERS_FILE)): OrderRepository {
  const orders = createCollection<Order>(filePath, { normalize: normalizeLine })
  const findByCode = async (code: string): Promise<Order | null> => (await orders.all()).find((order) => order.code === code) ?? null
  return {
    create: (order) => orders.put(order),
    findByCode,
    listForUser: async (userId) => [...(await orders.all())].filter((order) => order.userId === userId).sort(newestFirst),
    couponUsage: async (code, userId) => couponUsageIn(await orders.all(), code, userId),
    mutate: (decide) => orders.mutate(decide),
    updateStatus: (code, next, now, guard) => orders.mutate((all) => decideStatus(all, code, next, now, guard)),
  }
}
