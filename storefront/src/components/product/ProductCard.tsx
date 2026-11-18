import Image from 'next/image'
import Link from 'next/link'
import { Price } from '@/components/ui/Price'
import type { Product } from '@/lib/catalog/types'
import { discountPercent } from '@/lib/format'

const MAX_THUMBS = 6

export function ProductCard({ product }: { readonly product: Product }) {
  const discount = discountPercent(product.price, product.compareAtPrice)
  const cover = product.colors[0]?.image ?? `https://picsum.photos/seed/${product.slug}/800/800`
  return (
    <article className="h-full overflow-hidden rounded-product border border-card-line bg-white transition hover:shadow-card">
      <Link href={`/san-pham/${product.slug}`} className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        <div className="relative aspect-square bg-soft">
          <Image src={cover} alt={product.name} fill sizes="(max-width: 849px) 50vw, 280px" className="object-cover" />
          {discount !== null ? (
            <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <ul className="flex min-h-7 gap-1.5" aria-hidden="true">
            {product.colors.slice(0, MAX_THUMBS).map((color) => (
              <li key={color.name}>
                <Image data-testid="color-thumb" src={color.image} alt="" width={28} height={28} className="h-7 w-7 rounded-full border border-line object-cover" />
              </li>
            ))}
          </ul>
          <h3 className="line-clamp-2 break-words text-base font-extrabold text-ink">{product.name}</h3>
          <div className="mt-auto">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} kind={product.kind} />
          </div>
        </div>
      </Link>
    </article>
  )
}
