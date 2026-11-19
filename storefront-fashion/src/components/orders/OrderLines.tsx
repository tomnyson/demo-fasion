import { formatVnd } from '@/lib/format'
import type { Order } from '@/lib/orders/schema'

type OrderAmounts = Pick<Order, 'lines' | 'subtotal' | 'discount' | 'couponCode' | 'shipping' | 'total'>

/** Items and totals of a stored order, with the coupon discount line when one applied. */
export function OrderLines({ order }: { readonly order: OrderAmounts }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <ul className="space-y-2 text-sm text-ink">
        {order.lines.map((item) => (
          <li key={`${item.productId}|${item.size}|${item.color}`} className="flex justify-between gap-3">
            <span>
              {item.name} ({item.size}, {item.color}) × {item.quantity}
            </span>
            <span className="shrink-0">{formatVnd(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm text-ink">
        <div className="flex justify-between"><dt>Tạm tính</dt><dd>{formatVnd(order.subtotal)}</dd></div>
        {order.discount ? (
          <div className="flex justify-between text-brand-strong">
            <dt>Giảm giá{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
            <dd data-testid="order-discount">−{formatVnd(order.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between"><dt>Phí giao hàng</dt><dd>{order.shipping === 0 ? 'Miễn phí' : formatVnd(order.shipping)}</dd></div>
        <div className="flex justify-between text-base font-black text-ink"><dt>Tổng cộng</dt><dd className="text-price">{formatVnd(order.total)}</dd></div>
      </dl>
    </div>
  )
}
