import type { ComponentProps } from 'react'
import { FormField } from '@/components/ui/FormField'
import { MAX_QUOTE_QTY, MIN_QUOTE_QTY } from '@/config/commerce'

type FieldErrors = Readonly<Record<string, string>>

interface QuoteFieldsProps {
  readonly sports: readonly { slug: string; name: string }[]
  readonly defaultSport: string | undefined
  readonly compact: boolean
  readonly errors: FieldErrors
}

const Field = (props: Omit<ComponentProps<typeof FormField>, 'idPrefix'>) => <FormField idPrefix="quote" {...props} />

export function QuoteFields({ sports, defaultSport, compact, errors }: QuoteFieldsProps) {
  return (
    <>
      <Field name="name" label="Họ và tên" error={errors.name}>
        {(props) => <input type="text" autoComplete="name" {...props} />}
      </Field>
      <Field name="phone" label="Số điện thoại" error={errors.phone}>
        {(props) => <input type="tel" autoComplete="tel" {...props} />}
      </Field>
      <Field name="sport" label="Môn thể thao" error={errors.sport}>
        {(props) => (
          <select defaultValue={defaultSport ?? ''} {...props}>
            <option value="">Chọn môn thể thao</option>
            {sports.map((sport) => (
              <option key={sport.slug} value={sport.slug}>
                {sport.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field name="quantity" label="Số lượng (bộ)" error={errors.quantity}>
        {(props) => <input type="number" inputMode="numeric" min={MIN_QUOTE_QTY} max={MAX_QUOTE_QTY} defaultValue={10} {...props} />}
      </Field>
      {compact ? null : (
        <Field name="message" label="Nội dung yêu cầu" error={errors.message}>
          {(props) => <textarea rows={4} {...props} />}
        </Field>
      )}
    </>
  )
}
