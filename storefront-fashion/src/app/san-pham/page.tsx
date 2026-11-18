import type { Metadata } from 'next'
import { ListingView } from '@/components/listing/ListingView'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { listProducts } from '@/lib/catalog/repository'

interface AllProductsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = { title: 'Tất cả sản phẩm' }

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const { sort, page } = parseListingParams(await searchParams)
  return (
    <ListingView
      title="Tất cả sản phẩm"
      crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Tất cả sản phẩm' }]}
      result={listProducts({ sort, page })}
      sort={sort}
      basePath="/san-pham"
      emptyMessage="Chưa có sản phẩm."
    />
  )
}
