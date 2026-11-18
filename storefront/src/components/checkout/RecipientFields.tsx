import type { ReactNode } from 'react'

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Tỉnh/thành khác'] as const

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank', label: 'Chuyển khoản ngân hàng' },
] as const

const INPUT_CLASS =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-accent'

type FieldErrors = Readonly<Record<string, string>>

interface FieldProps {
  readonly name: string
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

function PaymentFieldset() {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold text-ink">Hình thức thanh toán</legend>
      {PAYMENT_OPTIONS.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm text-ink">
          <input type="radio" name="payment" value={option.value} defaultChecked={option.value === 'cod'} />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}

export function RecipientFields({ errors }: { readonly errors: FieldErrors }) {
  return (
    <>
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
      <PaymentFieldset />
    </>
  )
}
