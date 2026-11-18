import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import type { ProductPage, SortKey } from '@/lib/catalog/types'
import { Pagination } from './Pagination'
import { SortSelect } from './SortSelect'

interface ListingViewProps {
  readonly title: string
  readonly crumbs: readonly BreadcrumbItem[]
  readonly result: ProductPage
  readonly sort: SortKey
  readonly basePath: string
  readonly query?: string
  readonly emptyMessage: string
  readonly showSort?: boolean
}

function buildHref(basePath: string, query: string, sort: SortKey, page: number): string {
  const params = new URLSearchParams()
  if (query !== '') params.set('q', query)
  if (sort !== 'newest') params.set('sort', sort)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs === '' ? basePath : `${basePath}?${qs}`
}

export function ListingView({ title, crumbs, result, sort, basePath, query = '', emptyMessage, showSort = true }: ListingViewProps) {
  const hrefFor = (page: number) => buildHref(basePath, query, sort, page)
  return (
    <div className="container-site py-8">
      <Breadcrumb items={crumbs} />
      <h1 className="mt-4 text-[30px] font-black uppercase leading-tight text-ink">{title}</h1>

      {result.total === 0 ? (
        <p className="py-12 text-center text-muted">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{`Hiển thị ${result.from}–${result.to} của ${result.total} kết quả`}</p>
            {showSort ? (
              <Suspense fallback={null}>
                <SortSelect value={sort} />
              </Suspense>
            ) : null}
          </div>
          <div className="mt-6">
            <ProductGrid products={result.items} />
          </div>
          <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
        </>
      )}
    </div>
  )
}
