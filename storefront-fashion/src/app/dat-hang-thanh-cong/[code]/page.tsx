import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { formatVnd } from '@/lib/format'
import { ORDER_CODE_PATTERN } from '@/lib/orders/code'
import { createFileOrderRepository } from '@/lib/orders/repository'
import type { PublicOrder } from '@/lib/orders/schema'
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

function OrderLines({ order }: { readonly order: PublicOrder }) {
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
        <div className="flex justify-between"><dt>Phí giao hàng</dt><dd>{order.shipping === 0 ? 'Miễn phí' : formatVnd(order.shipping)}</dd></div>
        <div className="flex justify-between text-base font-black text-ink"><dt>Tổng cộng</dt><dd className="text-price">{formatVnd(order.total)}</dd></div>
      </dl>
    </div>
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

  return (
    <div className="container-site flex max-w-3xl flex-col gap-6 py-10">
      <div>
        <h1 className="text-[28px] font-black uppercase text-ink">Đặt hàng thành công</h1>
        <p className="mt-2 text-ink">
          Mã đơn hàng của bạn: <strong data-testid="order-code">{order.code}</strong>
        </p>
        <p className="text-sm text-muted">Chúng tôi sẽ liên hệ để xác nhận đơn hàng trong thời gian sớm nhất.</p>
      </div>
      <OrderLines order={order} />
      {order.payment === 'bank' ? <BankTransfer code={order.code} /> : null}
      <Button variant="soft" href="/danh-muc/ao" className="self-start">
        TIẾP TỤC MUA SẮM
      </Button>
    </div>
  )
}
