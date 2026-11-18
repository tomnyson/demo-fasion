import Image from 'next/image'
import Link from 'next/link'
import { Price } from '@/components/ui/Price'
import type { Product } from '@/lib/catalog/types'
import { discountPercent } from '@/lib/format'

export function ProductCard({ product }: { readonly product: Product }) {
  const discount = discountPercent(product.price, product.compareAtPrice)
  const cover = product.colors[0]?.image ?? `https://picsum.photos/seed/${product.slug}/900/1200`
  return (
    <article className="h-full overflow-hidden rounded-product border border-card-line bg-white transition hover:shadow-card">
      <Link href={`/san-pham/${product.slug}`} className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong">
        <div className="relative aspect-[3/4] bg-soft">
          <Image src={cover} alt={product.name} fill sizes="(max-width: 849px) 50vw, 280px" className="object-cover" />
          {discount !== null ? (
            <span className="absolute left-2 top-2 rounded-full bg-price px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="line-clamp-2 break-words text-base font-extrabold text-ink">{product.name}</h3>
          <div className="mt-auto">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          </div>
        </div>
      </Link>
    </article>
  )
}
