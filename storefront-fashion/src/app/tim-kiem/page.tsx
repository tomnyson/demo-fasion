import type { Metadata } from 'next'
import { ListingView } from '@/components/listing/ListingView'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { listProducts } from '@/lib/catalog/repository'
import type { ProductPage } from '@/lib/catalog/types'

interface SearchPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = { title: 'Tìm kiếm' }

const NO_RESULT: ProductPage = { items: [], total: 0, page: 1, pageCount: 1, from: 0, to: 0 }

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { sort, page, query } = parseListingParams(await searchParams)
  const result = query === '' ? NO_RESULT : listProducts({ query, sort, page })
  const emptyMessage = query === '' ? 'Nhập từ khoá để tìm sản phẩm.' : `Không tìm thấy sản phẩm cho “${query}”.`
  return (
    <ListingView
      title="Tìm kiếm"
      crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Tìm kiếm' }]}
      result={result}
      sort={sort}
      basePath="/tim-kiem"
      query={query}
      emptyMessage={emptyMessage}
      showSort={false}
    />
  )
}
