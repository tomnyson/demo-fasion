'use client'

import { useState, type KeyboardEvent } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { publicCoupons } from '@/lib/coupons/evaluate'
import type { CouponPreview } from '@/lib/coupons/preview'
import { postJson } from '@/lib/http/client'

interface CouponFieldProps {
  readonly applied: CouponPreview | null
  readonly onApply: (preview: CouponPreview) => void
  readonly onRemove: () => void
  /** Error the order API returned for the code, shown when the customer has not retried yet. */
  readonly serverError?: string
}

const INPUT_ID = 'checkout-coupon'
const ERROR_ID = 'checkout-coupon-error'
const SUGGESTIONS = publicCoupons()

function AppliedCoupon({ applied, onRemove }: { readonly applied: CouponPreview; readonly onRemove: () => void }) {
  return (
    <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-brand bg-soft px-4 py-3 text-sm text-ink">
      <p>
        Đã áp dụng mã <strong>{applied.code}</strong>
        <span className="block text-muted">{applied.label}</span>
      </p>
      <button type="button" onClick={onRemove} className="shrink-0 font-semibold text-brand-strong underline underline-offset-2">
        Bỏ mã
      </button>
    </div>
  )
}

export function CouponField({ applied, onApply, onRemove, serverError }: CouponFieldProps) {
  const { lines } = useCart()
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply(raw: string) {
    if (pending) return
    setPending(true)
    setError(null)
    const response = await postJson<CouponPreview>('/api/coupons/preview', { code: raw, lines })
    setPending(false)
    if (response.success) {
      setCode('')
      onApply(response.data)
      return
    }
    setError(response.error.fields?.couponCode ?? response.error.message)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    void apply(code)
  }

  const shownError = error ?? serverError ?? null

  return (
    <section aria-label="Ưu đãi" className="flex flex-col gap-2 border-t border-line pt-3">
      {applied === null ? (
        <>
          <label htmlFor={INPUT_ID} className="text-sm font-semibold text-ink">
            Mã giảm giá
          </label>
          <div className="flex gap-2">
            <input
              id={INPUT_ID}
              type="text"
              value={code}
              maxLength={32}
              autoComplete="off"
              placeholder="Nhập mã"
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-invalid={shownError === null ? undefined : true}
              aria-describedby={shownError === null ? undefined : ERROR_ID}
              className="min-w-0 flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm uppercase text-ink placeholder:normal-case focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong aria-[invalid=true]:border-price"
            />
            <button
              type="button"
              onClick={() => void apply(code)}
              disabled={pending}
              className="shrink-0 rounded-xl bg-brand-strong px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {pending ? 'Đang kiểm tra…' : 'ÁP DỤNG'}
            </button>
          </div>
          {shownError === null ? null : (
            <p id={ERROR_ID} role="alert" className="text-sm text-price">
              {shownError}
            </p>
          )}
          <ul aria-label="Mã đang có" className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((coupon) => (
              <li key={coupon.code}>
                <button
                  type="button"
                  title={coupon.label}
                  onClick={() => void apply(coupon.code)}
                  disabled={pending}
                  className="rounded-full border border-dashed border-brand px-3 py-1 text-xs font-semibold text-brand-strong hover:bg-soft disabled:opacity-60"
                >
                  {coupon.code}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <AppliedCoupon applied={applied} onRemove={onRemove} />
      )}
    </section>
  )
}
