import { ORDER_CODE_PATTERN } from './code'
import type { OrderRepository } from './repository'
import { isOrderStatus, ORDER_STATUSES, STATUS_LABELS } from './status'

export interface StatusCliDeps {
  readonly repo: OrderRepository
  readonly now: () => Date
  readonly out: (line: string) => void
  readonly err: (line: string) => void
}

export const USAGE = `Cách dùng: pnpm order:status <MÃ ĐƠN> <${ORDER_STATUSES.join('|')}>`

/** `pnpm order:status <CODE> <status>` for staff (A5). Returns the process exit code. */
export async function runOrderStatus(args: readonly string[], { repo, now, out, err }: StatusCliDeps): Promise<number> {
  const [rawCode, rawStatus] = args
  if (args.length !== 2 || rawCode === undefined || rawStatus === undefined) {
    err(USAGE)
    return 2
  }
  const code = rawCode.trim().toUpperCase()
  const next = rawStatus.trim().toLowerCase()
  if (!ORDER_CODE_PATTERN.test(code)) {
    err(`Mã đơn không hợp lệ: ${rawCode}`)
    return 2
  }
  if (!isOrderStatus(next)) {
    err(`Trạng thái không hợp lệ: ${rawStatus}. Chọn một trong: ${ORDER_STATUSES.join(', ')}.`)
    return 2
  }
  const result = await repo.updateStatus(code, next, now())
  if (result.ok) {
    out(`Đã chuyển đơn ${code} sang "${STATUS_LABELS[next]}" (${next}).`)
    return 0
  }
  if (result.reason === 'not_found') {
    err(`Không tìm thấy đơn ${code}.`)
    return 1
  }
  err(`Không thể chuyển đơn ${code} từ "${STATUS_LABELS[result.order.status]}" sang "${STATUS_LABELS[next]}".`)
  return 1
}
