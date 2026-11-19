import type { ComponentProps } from 'react'
import { FormField } from '@/components/ui/FormField'
import { PROVINCES } from '@/config/provinces'

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank', label: 'Chuyển khoản ngân hàng' },
] as const

type FieldErrors = Readonly<Record<string, string>>

const Field = (props: Omit<ComponentProps<typeof FormField>, 'idPrefix'>) => <FormField idPrefix="checkout" {...props} />

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

interface RecipientFieldsProps {
  readonly errors: FieldErrors
  /** False when a saved address supplies name, phone, province and address; email, note and payment stay. */
  readonly shipping?: boolean
}

function ShippingFields({ errors }: { readonly errors: FieldErrors }) {
  return (
    <>
      <Field name="name" label="Họ và tên" error={errors['customer.name']}>
        {(props) => <input type="text" autoComplete="name" {...props} />}
      </Field>
      <Field name="phone" label="Số điện thoại" error={errors['customer.phone']}>
        {(props) => <input type="tel" autoComplete="tel" {...props} />}
      </Field>
    </>
  )
}

function PlaceFields({ errors }: { readonly errors: FieldErrors }) {
  return (
    <>
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
    </>
  )
}

export function RecipientFields({ errors, shipping = true }: RecipientFieldsProps) {
  return (
    <>
      {shipping ? <ShippingFields errors={errors} /> : null}
      <Field name="email" label="Email (không bắt buộc)" error={errors['customer.email']}>
        {(props) => <input type="email" autoComplete="email" {...props} />}
      </Field>
      {shipping ? <PlaceFields errors={errors} /> : null}
      <Field name="note" label="Ghi chú" error={errors['customer.note']}>
        {(props) => <textarea rows={3} {...props} />}
      </Field>
      <PaymentFieldset />
    </>
  )
}
