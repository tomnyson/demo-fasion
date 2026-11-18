import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Pagination } from '@/components/listing/Pagination'
import { SortSelect } from '@/components/listing/SortSelect'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { getCategories, getCategory, getChildCategories, listProducts } from '@/lib/catalog/repository'

interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }))
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
  const children = getChildCategories(slug)
  const parent = category.parentSlug === null ? null : getCategory(category.parentSlug)

  const crumbs: readonly BreadcrumbItem[] = [
    { label: 'Trang chủ', href: '/' },
    ...(parent ? [{ label: parent.name, href: `/danh-muc/${parent.slug}` }] : []),
    { label: category.name },
  ]

  const hrefFor = (target: number) => {
    const query = new URLSearchParams()
    if (sort !== 'newest') query.set('sort', sort)
    if (target > 1) query.set('page', String(target))
    const qs = query.toString()
    return qs === '' ? `/danh-muc/${slug}` : `/danh-muc/${slug}?${qs}`
  }

  return (
    <div className="container-site py-8">
      <Breadcrumb items={crumbs} />
      <h1 className="mt-4 text-[30px] font-black uppercase leading-tight text-navy">{category.name}</h1>

      {children.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Danh mục con">
          {children.map((child) => (
            <li key={child.slug}>
              <Link
                href={`/danh-muc/${child.slug}`}
                className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

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
