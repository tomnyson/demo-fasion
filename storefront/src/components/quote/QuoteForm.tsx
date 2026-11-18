'use client'

import { Button } from '@/components/ui/Button'
import { QuoteFields } from './QuoteFields'
import { useQuoteSubmit } from './useQuoteSubmit'

interface QuoteFormProps {
  readonly sports: readonly { slug: string; name: string }[]
  readonly product?: { slug: string; name: string }
  readonly defaultSport?: string
  readonly compact?: boolean
}

export function QuoteForm({ sports, product, defaultSport, compact = false }: QuoteFormProps) {
  const { pending, sent, errors, formError, handleSubmit } = useQuoteSubmit(compact, product?.slug)

  if (sent) {
    return (
      <p role="status" className="rounded-card border border-line bg-white p-5 font-semibold text-ink shadow-card">
        Đã nhận yêu cầu. Chúng tôi sẽ liên hệ trong 24 giờ.
      </p>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card">
      {product === undefined ? null : <p className="text-sm font-semibold text-navy">Sản phẩm quan tâm: {product.name}</p>}
      <QuoteFields sports={sports} defaultSport={defaultSport} compact={compact} errors={errors} />
      {formError === null ? null : (
        <p role="alert" className="text-sm font-semibold text-accent">
          {formError}
        </p>
      )}
      <Button variant="red" type="submit" disabled={pending}>
        {pending ? 'Đang gửi…' : 'GỬI YÊU CẦU'}
      </Button>
    </form>
  )
}
