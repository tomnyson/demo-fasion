import { ProductGrid } from '@/components/product/ProductGrid'
import { getCategory, listProducts } from '@/lib/catalog/repository'
import Link from 'next/link'

const BLOCK_SIZE = 4

export function ProductBlock({ categorySlug, subtitle }: { readonly categorySlug: string; readonly subtitle: string }) {
  const category = getCategory(categorySlug)
  if (!category) return null
  const { items } = listProducts({ categorySlug, pageSize: BLOCK_SIZE, sort: 'popular' })
  if (items.length === 0) return null
  return (
    <section aria-labelledby={`block-${categorySlug}`} className="rounded-card bg-white p-5 shadow-card min-[850px]:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={`block-${categorySlug}`} className="text-[26px] font-black uppercase leading-tight text-brand">{category.name}</h2>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
        <Link href={`/danh-muc/${categorySlug}`} className="text-sm font-bold uppercase text-brand hover:underline">
          XEM TẤT CẢ →
        </Link>
      </div>
      <ProductGrid products={items} />
    </section>
  )
}
