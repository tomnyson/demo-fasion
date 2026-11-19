import type { Order } from './schema'
import { isOrderStatus, type StatusChange } from './status'

type RawRecord = Readonly<Record<string, unknown>>

const isRecord = (value: unknown): value is RawRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

const isStatusChange = (value: unknown): value is StatusChange =>
  isRecord(value) && isOrderStatus(value.status) && typeof value.at === 'string'

/**
 * Upgrades a stored order line to the current shape. Lines written before accounts existed have no
 * `id`, `status` or `statusHistory`; they become `pending` orders keyed by their code. Returns `null`
 * for lines that are not orders at all.
 */
export function normalizeOrder(raw: unknown): Order | null {
  if (!isRecord(raw) || typeof raw.code !== 'string' || typeof raw.createdAt !== 'string') return null
  const status = isOrderStatus(raw.status) ? raw.status : 'pending'
  const history = Array.isArray(raw.statusHistory) ? raw.statusHistory.filter(isStatusChange) : []
  return {
    ...(raw as unknown as Order),
    id: typeof raw.id === 'string' ? raw.id : raw.code,
    status,
    statusHistory: history.length > 0 ? history : [{ status, at: raw.createdAt }],
  }
}
