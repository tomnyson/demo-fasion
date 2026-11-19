import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CancelOrderButton } from '@/components/account/CancelOrderButton'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'
import { OrderTimeline } from '@/components/account/OrderTimeline'
import { OrderLines } from '@/components/orders/OrderLines'
import { requireAccountUser } from '@/lib/account/guard'
import { formatDateTime } from '@/lib/format'
import { findOwnOrder } from '@/lib/orders/owned'
import { createFileOrderRepository } from '@/lib/orders/repository'
import type { Order } from '@/lib/orders/schema'
import { canCustomerCancel } from '@/lib/orders/status'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Chi tiết đơn hàng', robots: { index: false } }

const PAYMENT_LABELS: Readonly<Record<Order['payment'], string>> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank: 'Chuyển khoản ngân hàng',
}

const CARD = 'flex flex-col gap-2 rounded-card border border-line bg-white p-5 text-sm text-ink shadow-card'

function Recipient({ order }: { readonly order: Order }) {
  const { customer } = order
  return (
    <section aria-label="Địa chỉ nhận hàng" className={CARD}>
      <h2 className="font-bold">Địa chỉ nhận hàng</h2>
      <p className="break-words font-semibold">{customer.name}</p>
      <p className="text-muted">{customer.phone}</p>
      <p className="break-words">
        {customer.address}, {customer.province}
      </p>
      {customer.note === undefined ? null : <p className="break-words text-muted">Ghi chú: {customer.note}</p>}
      <p className="text-muted">{PAYMENT_LABELS[order.payment]}</p>
    </section>
  )
}

interface OrderDetailProps {
  readonly params: Promise<{ code: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { code } = await params
  const user = await requireAccountUser(`/tai-khoan/don-hang/${code}`)
  const order = await findOwnOrder(createFileOrderRepository(), user.id, code)
  if (order === null) notFound()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/tai-khoan/don-hang" className="text-sm font-semibold text-brand-strong underline underline-offset-2">
          ← Tất cả đơn hàng
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="break-all text-[24px] font-black uppercase leading-tight text-ink">Đơn {order.code}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted">Đặt lúc {formatDateTime(order.createdAt)}</p>
      </div>
      <div className="grid items-start gap-6 min-[850px]:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-w-0 flex-col gap-6">
          <OrderLines order={order} />
          <Recipient order={order} />
        </div>
        <aside className={CARD}>
          <h2 className="mb-2 font-bold">Trạng thái</h2>
          <OrderTimeline status={order.status} history={order.statusHistory} />
          {canCustomerCancel(order) ? <CancelOrderButton code={order.code} /> : null}
        </aside>
      </div>
    </section>
  )
}
