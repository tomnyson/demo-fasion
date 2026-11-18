import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ListingView } from '@/components/listing/ListingView'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { getCategories, getCategory, listProducts } from '@/lib/catalog/repository'

interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Pick<CategoryPageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params
  return { title: getCategory(slug)?.name ?? 'Không tìm thấy trang' }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = getCategory(slug)
  if (category === null) notFound()

  const { sort, page } = parseListingParams(await searchParams)
  return (
    <ListingView
      title={category.name}
      crumbs={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Sản phẩm', href: '/san-pham' },
        { label: category.name },
      ]}
      result={listProducts({ categorySlug: category.slug, sort, page })}
      sort={sort}
      basePath={`/danh-muc/${category.slug}`}
      emptyMessage="Chưa có sản phẩm trong danh mục này."
    />
  )
}
