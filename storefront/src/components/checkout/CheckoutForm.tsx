'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { postJson } from '@/lib/http/client'
import { formatVnd } from '@/lib/format'

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Tỉnh/thành khác'] as const

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank', label: 'Chuyển khoản ngân hàng' },
] as const

const CUSTOMER_FIELDS = ['name', 'phone', 'email', 'province', 'address', 'note'] as const
const GENERIC_ERROR = 'Có lỗi xảy ra. Vui lòng thử lại.'
const INPUT_CLASS =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-accent'

type FieldErrors = Readonly<Record<string, string>>

function textOf(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

function buildPayload(form: HTMLFormElement, lines: readonly unknown[]) {
  const data = new FormData(form)
  const customer = Object.fromEntries(CUSTOMER_FIELDS.map((name) => [name, textOf(data, name)]))
  return { customer, payment: textOf(data, 'payment'), lines }
}

interface FieldProps {
  readonly name: (typeof CUSTOMER_FIELDS)[number]
  readonly label: string
  readonly error: string | undefined
  readonly children: (props: { id: string; name: string; className: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}

function Field({ name, label, error, children }: FieldProps) {
  const id = `checkout-${name}`
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({
        id,
        name,
        className: INPUT_CLASS,
        ...(error === undefined ? {} : { 'aria-invalid': true as const, 'aria-describedby': errorId }),
      })}
      {error === undefined ? null : (
        <p id={errorId} className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  )
}

function OrderSummary() {
  const { totals } = useCart()
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
      <dl className="space-y-2 border-t border-line pt-3 text-sm text-ink">
        <div className="flex justify-between">
          <dt>Tạm tính</dt>
          <dd>{formatVnd(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Phí giao hàng</dt>
          <dd>{totals.shipping === 0 ? 'Miễn phí' : formatVnd(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between text-base font-black text-navy">
          <dt>Tổng cộng</dt>
          <dd data-testid="checkout-total" className="text-price">
            {formatVnd(totals.total)}
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
      <Button variant="blue" href="/danh-muc/ao-bong-da-khong-logo">
        TIẾP TỤC MUA SẮM
      </Button>
    </div>
  )
}

export function CheckoutForm() {
  const router = useRouter()
  const { lines, hydrated, clear } = useCart()
  const [pending, setPending] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const inFlight = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setErrors({})
    setFormError(null)
    const response = await postJson<{ code: string }>('/api/orders', buildPayload(event.currentTarget, lines))
    if (response.success) {
      setPlaced(true)
      clear()
      router.replace(`/dat-hang-thanh-cong/${response.data.code}`)
      return
    }
    const fields = response.error.fields ?? {}
    setErrors(fields)
    const hasFieldError = Object.keys(fields).some((key) => key.startsWith('customer.'))
    setFormError(fields.lines ?? (hasFieldError ? null : response.error.message || GENERIC_ERROR))
    setPending(false)
    inFlight.current = false
  }

  if (!hydrated) return <div className="min-h-64" aria-busy="true" />
  if (placed) return <p role="status" className="text-ink">Đang chuyển đến trang xác nhận…</p>
  if (lines.length === 0) return <EmptyCart />

  return (
    <div className="grid items-start gap-6 min-[850px]:grid-cols-[1fr_380px]">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card">
        <Field name="name" label="Họ và tên" error={errors['customer.name']}>
          {(props) => <input type="text" autoComplete="name" {...props} />}
        </Field>
        <Field name="phone" label="Số điện thoại" error={errors['customer.phone']}>
          {(props) => <input type="tel" autoComplete="tel" {...props} />}
        </Field>
        <Field name="email" label="Email (không bắt buộc)" error={errors['customer.email']}>
          {(props) => <input type="email" autoComplete="email" {...props} />}
        </Field>
        <Field name="province" label="Tỉnh/Thành phố" error={errors['customer.province']}>
          {(props) => (
            <select defaultValue="" {...props}>
              <option value="">Chọn tỉnh/thành</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field name="address" label="Địa chỉ" error={errors['customer.address']}>
          {(props) => <input type="text" autoComplete="street-address" {...props} />}
        </Field>
        <Field name="note" label="Ghi chú" error={errors['customer.note']}>
          {(props) => <textarea rows={3} {...props} />}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">Hình thức thanh toán</legend>
          {PAYMENT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm text-ink">
              <input type="radio" name="payment" value={option.value} defaultChecked={option.value === 'cod'} />
              {option.label}
            </label>
          ))}
        </fieldset>
        {formError === null ? null : (
          <p role="alert" className="text-sm font-semibold text-accent">
            {formError}
          </p>
        )}
        <Button variant="red" type="submit" disabled={pending}>
          {pending ? 'Đang xử lý…' : 'ĐẶT HÀNG'}
        </Button>
      </form>
      <OrderSummary />
    </div>
  )
}
