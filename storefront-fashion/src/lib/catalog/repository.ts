import { PAGE_SIZE } from '@/config/commerce'
import { normalizeText } from '../text'
import { CATEGORIES } from './categories'
import { COLLECTIONS, inCollection } from './collections'
import { PRODUCTS } from './products'
import type { Category, Collection, CollectionSlug, Product, ProductPage, SortKey } from './types'

export const SORT_LABELS: Readonly<Record<SortKey, string>> = Object.freeze({
  popular: 'Sắp xếp theo mức độ phổ biến',
  newest: 'Sắp xếp theo mới nhất',
  'price-asc': 'Sắp xếp theo giá: thấp đến cao',
  'price-desc': 'Sắp xếp theo giá: cao đến thấp',
})

const COMPARATORS: Readonly<Record<SortKey, (a: Product, b: Product) => number>> = {
  popular: (a, b) => b.popularity - a.popularity || b.createdAt.localeCompare(a.createdAt),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price || b.createdAt.localeCompare(a.createdAt),
  'price-desc': (a, b) => b.price - a.price || b.createdAt.localeCompare(a.createdAt),
}

export function getCategories(): readonly Category[] {
  return CATEGORIES
}

export function getCategory(slug: string): Category | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null
}

export function getCollection(slug: string): Collection | null {
  return COLLECTIONS.find((c) => c.slug === slug) ?? null
}

export function getProduct(slug: string): Product | null {
  return PRODUCTS.find((p) => p.slug === slug) ?? null
}

export function getProductById(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) ?? null
}

interface ListOptions {
  categorySlug?: string
  collectionSlug?: CollectionSlug
  query?: string
  sort?: SortKey
  page?: number
  pageSize?: number
}

export function listProducts(opts: ListOptions): ProductPage {
  const { categorySlug, collectionSlug, query, sort = 'newest', page = 1, pageSize = PAGE_SIZE } = opts
  const needle = query ? normalizeText(query) : ''

  const matched = PRODUCTS.filter(
    (p) =>
      (categorySlug === undefined || p.categorySlug === categorySlug) &&
      (collectionSlug === undefined || inCollection(p, collectionSlug)) &&
      (needle === '' || normalizeText(p.name).includes(needle)),
  )
  const sorted = [...matched].sort(COMPARATORS[sort])

  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount)
  const start = (current - 1) * pageSize
  const items = sorted.slice(start, start + pageSize)

  return {
    items,
    total,
    page: current,
    pageCount,
    from: total === 0 ? 0 : start + 1,
    to: total === 0 ? 0 : start + items.length,
  }
}

export function getRelatedProducts(product: Product, limit = 8): readonly Product[] {
  return PRODUCTS.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, limit)
}

const PREVIEW_SORT: Readonly<Record<CollectionSlug, SortKey>> = {
  'noi-bat': 'popular',
  'best-seller': 'popular',
  'hang-moi': 'newest',
  sale: 'newest',
}

export function getCollectionPreview(slug: CollectionSlug, limit = 8): readonly Product[] {
  return listProducts({ collectionSlug: slug, sort: PREVIEW_SORT[slug], pageSize: limit }).items
}
