import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatDay, formatVnd } from '@/lib/format'
import type { Order } from '@/lib/orders/schema'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderRow = Pick<Order, 'code' | 'createdAt' | 'lines' | 'total' | 'status'>

const itemCount = (order: OrderRow): number => order.lines.reduce((sum, line) => sum + line.quantity, 0)

function EmptyOrders() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-line bg-white p-5 shadow-card">
      <p className="text-ink">Bạn chưa có đơn hàng nào.</p>
      <Button variant="soft" href="/danh-muc/ao">
        MUA SẮM NGAY
      </Button>
    </div>
  )
}

/** The customer's orders, newest first; each row links to its detail page. */
export function OrderList({ orders }: { readonly orders: readonly OrderRow[] }) {
  if (orders.length === 0) return <EmptyOrders />
  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.code}>
          <Link
            href={`/tai-khoan/don-hang/${order.code}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white p-5 shadow-card hover:border-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
          >
            <span className="min-w-0">
              <span className="block break-all font-bold text-ink">{order.code}</span>
              <span className="block text-sm text-muted">
                {formatDay(order.createdAt)} · {itemCount(order)} sản phẩm
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="font-black text-price">{formatVnd(order.total)}</span>
              <OrderStatusBadge status={order.status} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
