import { formatDateTime } from '@/lib/format'
import { STATUS_FLOW, STATUS_LABELS, type OrderStatus, type StatusChange } from '@/lib/orders/status'

interface TimelineStep {
  readonly status: OrderStatus
  readonly at?: string
}

/** Steps reached so far (with times), then the steps still ahead unless the order was cancelled. */
export function timelineSteps(status: OrderStatus, history: readonly StatusChange[]): readonly TimelineStep[] {
  const reached = history.map((change) => ({ status: change.status, at: change.at }))
  if (status === 'cancelled') return reached
  const ahead = STATUS_FLOW.slice(STATUS_FLOW.indexOf(status) + 1).map((next) => ({ status: next }))
  return [...reached, ...ahead]
}

export function OrderTimeline({ status, history }: { readonly status: OrderStatus; readonly history: readonly StatusChange[] }) {
  return (
    <ol aria-label="Tiến trình đơn hàng" className="flex flex-col gap-3 border-l-2 border-line pl-5">
      {timelineSteps(status, history).map((step, index) => (
        <li key={`${step.status}-${index}`} className="relative text-sm">
          <span
            aria-hidden="true"
            className={`absolute -left-[27px] top-1 size-3 rounded-full ${step.at === undefined ? 'border-2 border-line bg-white' : 'bg-brand-strong'}`}
          />
          <span className={step.at === undefined ? 'text-muted' : 'font-semibold text-ink'}>{STATUS_LABELS[step.status]}</span>
          {step.at === undefined ? null : <span className="block text-xs text-muted">{formatDateTime(step.at)}</span>}
        </li>
      ))}
    </ol>
  )
}
