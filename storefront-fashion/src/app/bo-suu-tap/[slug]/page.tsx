import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ListingView } from '@/components/listing/ListingView'
import { COLLECTIONS } from '@/lib/catalog/collections'
import { parseListingParams } from '@/lib/catalog/listing-params'
import { getCollection, listProducts } from '@/lib/catalog/repository'

interface CollectionPageProps {
  readonly params: Promise<{ slug: string }>
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }))
}

export async function generateMetadata({ params }: Pick<CollectionPageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params
  return { title: getCollection(slug)?.name ?? 'Không tìm thấy trang' }
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (collection === null) notFound()

  const { sort, page } = parseListingParams(await searchParams)
  return (
    <ListingView
      title={collection.name}
      crumbs={[{ label: 'Trang chủ', href: '/' }, { label: collection.name }]}
      result={listProducts({ collectionSlug: collection.slug, sort, page })}
      sort={sort}
      basePath={`/bo-suu-tap/${collection.slug}`}
      emptyMessage="Chưa có sản phẩm trong bộ sưu tập này."
    />
  )
}
