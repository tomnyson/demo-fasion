import { STATUS_LABELS, type OrderStatus } from '@/lib/orders/status'

const TONES: Readonly<Record<OrderStatus, string>> = {
  pending: 'bg-soft text-brand-strong',
  confirmed: 'bg-brand text-brand-ink',
  shipping: 'bg-brand-strong text-white',
  delivered: 'bg-ink text-white',
  cancelled: 'bg-line text-muted line-through decoration-1',
}

export function OrderStatusBadge({ status }: { readonly status: OrderStatus }) {
  return (
    <span data-status={status} className={`inline-flex shrink-0 rounded-full px-3 py-0.5 text-xs font-bold uppercase ${TONES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
