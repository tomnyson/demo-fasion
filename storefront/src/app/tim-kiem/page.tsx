import type { Metadata } from 'next'
import { Pagination } from '@/components/listing/Pagination'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { listProducts } from '@/lib/catalog/repository'

interface SearchPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = { title: 'Tìm kiếm' }

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { sort, page, query } = parseListingParams(await searchParams)
  const result = query === '' ? null : listProducts({ query, sort, page })

  const hrefFor = (target: number) => {
    const params = new URLSearchParams({ q: query })
    if (sort !== 'newest') params.set('sort', sort)
    if (target > 1) params.set('page', String(target))
    return `/tim-kiem?${params.toString()}`
  }

  return (
    <div className="container-site py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tìm kiếm' }]} />
      <h1 className="mt-4 text-[30px] font-black uppercase leading-tight text-navy">Tìm kiếm</h1>

      {result === null ? (
        <p className="py-12 text-center text-muted">Nhập từ khoá để tìm sản phẩm.</p>
      ) : result.total === 0 ? (
        <p className="py-12 text-center text-muted">{`Không tìm thấy sản phẩm cho “${query}”.`}</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">{`Hiển thị ${result.from}–${result.to} của ${result.total} kết quả`}</p>
          <div className="mt-6">
            <ProductGrid products={result.items} />
          </div>
          <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
        </>
      )}
    </div>
  )
}
