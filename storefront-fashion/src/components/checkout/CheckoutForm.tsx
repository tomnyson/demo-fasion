'use client'

import { useState, type ReactNode } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import type { CouponPreview } from '@/lib/coupons/preview'
import { formatVnd } from '@/lib/format'
import { CouponField } from './CouponField'
import { RecipientFields } from './RecipientFields'
import { useCheckoutSubmit } from './useCheckoutSubmit'

interface OrderSummaryProps {
  readonly coupon: CouponPreview | null
  readonly children: ReactNode
}

function OrderSummary({ coupon, children }: OrderSummaryProps) {
  const { totals } = useCart()
  const shipping = coupon?.shipping ?? totals.shipping
  const total = coupon?.total ?? totals.total
  return (
    <aside aria-label="Đơn hàng của bạn" className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 shadow-card">
      <ul className="space-y-2 text-sm text-ink">
        {totals.lines.map((item) => (
          <li key={item.key} className="flex justify-between gap-3">
            <span>
              {item.product.name} ({item.size}, {item.color}) × {item.quantity}
            </span>
            <span className="shrink-0">{formatVnd(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      {children}
      <dl className="space-y-2 border-t border-line pt-3 text-sm text-ink">
        <div className="flex justify-between">
          <dt>Tạm tính</dt>
          <dd>{formatVnd(totals.subtotal)}</dd>
        </div>
        {coupon === null || coupon.discount === 0 ? null : (
          <div className="flex justify-between text-brand-strong">
            <dt>Giảm giá ({coupon.code})</dt>
            <dd data-testid="checkout-discount">−{formatVnd(coupon.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Phí giao hàng</dt>
          <dd>{shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}</dd>
        </div>
        <div className="flex justify-between text-base font-black text-ink">
          <dt>Tổng cộng</dt>
          <dd data-testid="checkout-total" className="text-price">
            {formatVnd(total)}
          </dd>
        </div>
      </dl>
    </aside>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-ink">Giỏ hàng của bạn đang trống.</p>
      <Button variant="soft" href="/danh-muc/ao">
        TIẾP TỤC MUA SẮM
      </Button>
    </div>
  )
}

export function CheckoutForm() {
  const { lines, hydrated } = useCart()
  const [coupon, setCoupon] = useState<CouponPreview | null>(null)
  const [couponError, setCouponError] = useState<string | undefined>(undefined)
  const { pending, placed, errors, formError, handleSubmit } = useCheckoutSubmit({
    // The order API re-checks the code; if it refuses it, drop the code so the customer can pick another.
    onCouponRejected: (message) => {
      setCoupon(null)
      setCouponError(message)
    },
  })
  const applyCoupon = (next: CouponPreview | null) => {
    setCoupon(next)
    setCouponError(undefined)
  }

  if (!hydrated) return <div className="min-h-64" aria-busy="true" />
  if (placed) return <p role="status" className="text-ink">Đang chuyển đến trang xác nhận…</p>
  if (lines.length === 0) return <EmptyCart />

  return (
    <div className="grid items-start gap-6 min-[850px]:grid-cols-[1fr_380px]">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card">
        <RecipientFields errors={errors} />
        <input type="hidden" name="couponCode" value={coupon?.code ?? ''} />
        {formError === null ? null : (
          <p role="alert" className="text-sm font-semibold text-price">
            {formError}
          </p>
        )}
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Đang xử lý…' : 'ĐẶT HÀNG'}
        </Button>
      </form>
      <OrderSummary coupon={coupon}>
        <CouponField applied={coupon} onApply={applyCoupon} onRemove={() => applyCoupon(null)} serverError={couponError} />
      </OrderSummary>
    </div>
  )
}
