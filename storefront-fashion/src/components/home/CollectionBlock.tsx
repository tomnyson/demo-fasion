import Link from 'next/link'
import { ProductGrid } from '@/components/product/ProductGrid'
import { getCollection, getCollectionPreview } from '@/lib/catalog/repository'
import type { CollectionSlug } from '@/lib/catalog/types'

export function CollectionBlock({ slug }: { readonly slug: CollectionSlug }) {
  const collection = getCollection(slug)
  const products = getCollectionPreview(slug)
  if (!collection || products.length === 0) return null
  return (
    <section aria-labelledby={`block-${slug}`} className="py-8">
      <h2 id={`block-${slug}`} className="mb-5 text-left text-2xl font-bold uppercase leading-tight text-ink min-[850px]:text-[28px]">
        {collection.name}
      </h2>
      <ProductGrid products={products} />
      <div className="mt-6 text-center">
        <Link href={`/bo-suu-tap/${slug}`} className="inline-block rounded-full border border-brand-strong px-6 py-3 text-sm font-semibold uppercase text-brand-strong hover:bg-soft">
          XEM THÊM
        </Link>
      </div>
    </section>
  )
}
