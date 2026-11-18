import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Pagination } from '@/components/listing/Pagination'
import { SortSelect } from '@/components/listing/SortSelect'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { getCategories, getCategory, listProducts } from '@/lib/catalog/repository'
import type { Category } from '@/lib/catalog/types'

interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }))
}

function buildCrumbs(category: Category): readonly BreadcrumbItem[] {
  return [{ label: 'Trang chủ', href: '/' }, { label: category.name }]
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategory(slug)
  return { title: category?.name ?? 'Không tìm thấy trang' }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = getCategory(slug)
  if (category === null) notFound()

  const { sort, page } = parseListingParams(await searchParams)
  const result = listProducts({ categorySlug: slug, sort, page })

  const hrefFor = (target: number) => {
    const query = new URLSearchParams()
    if (sort !== 'newest') query.set('sort', sort)
    if (target > 1) query.set('page', String(target))
    const qs = query.toString()
    return qs === '' ? `/danh-muc/${slug}` : `/danh-muc/${slug}?${qs}`
  }

  return (
    <div className="container-site py-8">
      <Breadcrumb items={buildCrumbs(category)} />
      <h1 className="mt-4 text-[30px] font-black uppercase leading-tight text-ink">{category.name}</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{`Hiển thị ${result.from}–${result.to} của ${result.total} kết quả`}</p>
        <Suspense fallback={null}>
          <SortSelect value={sort} />
        </Suspense>
      </div>

      <div className="mt-6">
        {result.total === 0 ? (
          <p className="py-12 text-center text-muted">Chưa có sản phẩm trong danh mục này.</p>
        ) : (
          <ProductGrid products={result.items} />
        )}
      </div>
      <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
    </div>
  )
}
