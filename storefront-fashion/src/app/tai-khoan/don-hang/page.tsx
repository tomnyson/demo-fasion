import type { Metadata } from 'next'
import { OrderList } from '@/components/account/OrderList'
import { requireAccountUser } from '@/lib/account/guard'
import { createFileOrderRepository } from '@/lib/orders/repository'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Đơn hàng của tôi', robots: { index: false } }

export default async function OrdersPage() {
  const user = await requireAccountUser('/tai-khoan/don-hang')
  const orders = await createFileOrderRepository().listForUser(user.id)
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-[28px] font-black uppercase leading-tight text-ink">Đơn hàng của tôi</h1>
      <OrderList orders={orders} />
    </section>
  )
}
