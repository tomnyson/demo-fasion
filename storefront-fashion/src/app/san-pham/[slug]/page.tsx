import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { getCategory, getProduct, getRelatedProducts, listProducts } from '@/lib/catalog/repository'
import type { Category, Product } from '@/lib/catalog/types'
import { ProductView } from './ProductView'

interface ProductPageProps {
  readonly params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return listProducts({ pageSize: Number.MAX_SAFE_INTEGER }).items.map((product) => ({ slug: product.slug }))
}

function buildCrumbs(product: Product, category: Category | null): readonly BreadcrumbItem[] {
  const parent = category?.parentSlug ? getCategory(category.parentSlug) : null
  return [
    { label: 'Trang chủ', href: '/' },
    ...(parent ? [{ label: parent.name, href: `/danh-muc/${parent.slug}` }] : []),
    ...(category ? [{ label: category.name, href: `/danh-muc/${category.slug}` }] : []),
    { label: product.name },
  ]
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  return { title: getProduct(slug)?.name ?? 'Không tìm thấy trang' }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProduct(slug)
  if (product === null) notFound()

  const category = getCategory(product.categorySlug)
  const related = getRelatedProducts(product)

  return (
    <div className="container-site py-8">
      <Breadcrumb items={buildCrumbs(product, category)} />
      <div className="mt-6">
        <ProductView product={product} />
      </div>
      <div className="mt-6 text-sm text-muted">
        <p>
          SKU: <span className="font-semibold text-ink">{product.sku}</span>
        </p>
        {category ? (
          <p>
            Danh mục:{' '}
            <Link href={`/danh-muc/${category.slug}`} className="font-semibold text-brand-strong hover:underline">
              {category.name}
            </Link>
          </p>
        ) : null}
      </div>
      <section aria-labelledby="desc-title" className="mt-8">
        <h2 id="desc-title" className="inline-block border-b-2 border-brand-strong pb-2 text-lg font-black uppercase text-ink">
          Mô tả
        </h2>
        <p className="mt-4 max-w-3xl whitespace-pre-line text-ink">{product.description}</p>
      </section>
      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="mt-12">
          <h2 id="related-title" className="mb-6 text-[26px] font-black uppercase text-brand-strong">
            Sản phẩm tương tự
          </h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  )
}
