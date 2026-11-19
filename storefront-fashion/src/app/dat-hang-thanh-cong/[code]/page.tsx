import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { OrderLines } from '@/components/orders/OrderLines'
import { getCurrentUser } from '@/lib/auth/current-user'
import { ORDER_CODE_PATTERN } from '@/lib/orders/code'
import { createFileOrderRepository } from '@/lib/orders/repository'
import { toPublicOrder } from '@/lib/orders/service'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Đặt hàng thành công', robots: { index: false } }

const BANK = { name: 'Ngân hàng Mẫu', account: '0000 0000 0000' } as const

function BankTransfer({ code }: { readonly code: string }) {
  return (
    <section aria-label="Thông tin chuyển khoản" className="rounded-card border border-line bg-soft p-5 text-sm text-ink">
      <h2 className="mb-2 font-bold text-ink">Thông tin chuyển khoản (mẫu)</h2>
      <dl className="space-y-1">
        <div className="flex gap-2"><dt className="text-muted">Ngân hàng:</dt><dd>{BANK.name}</dd></div>
        <div className="flex gap-2"><dt className="text-muted">Số tài khoản:</dt><dd>{BANK.account}</dd></div>
        <div className="flex gap-2"><dt className="text-muted">Nội dung chuyển khoản:</dt><dd className="font-bold">{code}</dd></div>
      </dl>
    </section>
  )
}

interface OrderSuccessProps {
  readonly params: Promise<{ code: string }>
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { code } = await params
  if (!ORDER_CODE_PATTERN.test(code)) notFound()
  const stored = await createFileOrderRepository().findByCode(code)
  if (stored === null) notFound()
  const order = toPublicOrder(stored)
  // Public by code (A9); only the owner gets the link into their account.
  const viewer = stored.userId === undefined ? null : await getCurrentUser()
  const ownsOrder = viewer !== null && viewer.id === stored.userId

  return (
    <div className="container-site py-10">
      <div className="flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-[28px] font-black uppercase text-ink">Đặt hàng thành công</h1>
          <p className="mt-2 text-ink">
            Mã đơn hàng của bạn: <strong data-testid="order-code">{order.code}</strong>
          </p>
          <p className="text-sm text-muted">Chúng tôi sẽ liên hệ để xác nhận đơn hàng trong thời gian sớm nhất.</p>
        </div>
        <OrderLines order={order} />
        {order.payment === 'bank' ? <BankTransfer code={order.code} /> : null}
        <div className="flex flex-wrap gap-3">
          {ownsOrder ? (
            <Button variant="outline" href={`/tai-khoan/don-hang/${order.code}`}>
              Xem đơn hàng của bạn
            </Button>
          ) : null}
          <Button variant="soft" href="/danh-muc/ao">
            TIẾP TỤC MUA SẮM
          </Button>
        </div>
      </div>
    </div>
  )
}
