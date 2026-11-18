import type { Collection, CollectionSlug, Product, ProductTag } from './types'

export const COLLECTIONS: readonly Collection[] = Object.freeze([
  Object.freeze({ slug: 'noi-bat', name: 'Sản phẩm nổi bật' }),
  Object.freeze({ slug: 'best-seller', name: 'Best seller' }),
  Object.freeze({ slug: 'hang-moi', name: 'Hàng mới về' }),
  Object.freeze({ slug: 'sale', name: 'Sale' }),
] as const)

const TAG_BY_COLLECTION: Readonly<Record<Exclude<CollectionSlug, 'sale'>, ProductTag>> = {
  'noi-bat': 'featured',
  'best-seller': 'best-seller',
  'hang-moi': 'new',
}

export function isOnSale(product: Product): boolean {
  return product.compareAtPrice !== null && product.compareAtPrice > product.price
}

export function inCollection(product: Product, slug: CollectionSlug): boolean {
  if (slug === 'sale') return isOnSale(product)
  return product.tags.includes(TAG_BY_COLLECTION[slug])
}
