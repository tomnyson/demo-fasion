import { formatVnd } from '@/lib/format'

export interface PriceProps {
  readonly price: number
  readonly compareAtPrice: number | null
  readonly size?: 'card' | 'detail'
}

const CURRENT_SIZE = { card: 'text-xl', detail: 'text-3xl' } as const
const OLD_SIZE = { card: 'text-sm', detail: 'text-lg' } as const

export function Price({ price, compareAtPrice, size = 'card' }: PriceProps) {
  const hasOld = compareAtPrice !== null && compareAtPrice > price
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      {hasOld ? (
        <del className={`${OLD_SIZE[size]} text-muted`}>
          <span className="sr-only">Giá gốc:</span>
          {formatVnd(compareAtPrice)}
        </del>
      ) : null}
      <ins className={`${CURRENT_SIZE[size]} font-black text-price no-underline`}>
        <span className="sr-only">Giá hiện tại:</span>
        {formatVnd(price)}
      </ins>
    </p>
  )
}
