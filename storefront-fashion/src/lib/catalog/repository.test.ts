import { describe, expect, it } from 'vitest'
import {
  SORT_LABELS,
  getCategories,
  getCategory,
  getCollection,
  getCollectionPreview,
  getProduct,
  getRelatedProducts,
  listProducts,
} from '@/lib/catalog/repository'

const all = listProducts({ pageSize: 48 }).items

describe('catalogue listing', () => {
  it('has the expected category and product counts', () => {
    expect(getCategories().map((c) => c.slug)).toEqual(['dam', 'vay', 'ao', 'quan'])
    expect(listProducts({}).total).toBe(48)
    for (const slug of ['dam', 'vay', 'ao', 'quan']) expect(listProducts({ categorySlug: slug }).total).toBe(12)
  })

  it('filters by collection, alone and with a category', () => {
    expect(listProducts({ collectionSlug: 'noi-bat' }).total).toBe(12)
    expect(listProducts({ collectionSlug: 'best-seller' }).total).toBe(12)
    expect(listProducts({ collectionSlug: 'hang-moi' }).total).toBe(12)
    expect(listProducts({ collectionSlug: 'sale' }).total).toBe(16)
    expect(listProducts({ collectionSlug: 'sale', categorySlug: 'dam' }).total).toBe(4)
  })

  it('paginates and clamps the page', () => {
    const p1 = listProducts({})
    expect([p1.items.length, p1.pageCount, p1.from, p1.to]).toEqual([16, 3, 1, 16])
    const p3 = listProducts({ page: 3 })
    expect([p3.items.length, p3.from, p3.to]).toEqual([16, 33, 48])
    expect(listProducts({ page: 999 }).page).toBe(3)
  })

  it('sorts by price ascending', () => {
    const asc = listProducts({ sort: 'price-asc', pageSize: 48 }).items.map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
  })

  it('searches ignoring case and diacritics', () => {
    expect(listProducts({ query: 'dam' }).total).toBe(12)
    expect(listProducts({ query: '  ĐẦM ' }).total).toBe(12)
  })

  it('reports an empty result consistently', () => {
    const none = listProducts({ query: 'zzzz' })
    expect([none.total, none.pageCount, none.from, none.to]).toEqual([0, 1, 0, 0])
  })

  it('returns null for unknown slugs', () => {
    expect(getProduct('khong-ton-tai')).toBeNull()
    expect(getCategory('khong-ton-tai')).toBeNull()
    expect(getCollection('khong-co')).toBeNull()
  })

  it('looks up a collection by slug', () => {
    expect(getCollection('sale')?.name).toBe('Sale')
  })
})

describe('collection previews', () => {
  it('takes the most popular featured products', () => {
    const preview = getCollectionPreview('noi-bat')
    expect(preview).toHaveLength(8)
    expect(preview.every((p) => p.tags.includes('featured'))).toBe(true)
    expect(preview.map((p) => p.popularity)).toEqual([...preview.map((p) => p.popularity)].sort((a, b) => b - a))
  })

  it('takes the newest products for new arrivals and honours the limit', () => {
    const fresh = getCollectionPreview('hang-moi', 3).map((p) => p.createdAt)
    expect(fresh).toHaveLength(3)
    expect(fresh).toEqual([...fresh].sort().reverse())
  })

  it('orders best sellers by popularity and sale by newest', () => {
    const best = getCollectionPreview('best-seller').map((p) => p.popularity)
    expect(best).toEqual([...best].sort((a, b) => b - a))
    const sale = getCollectionPreview('sale').map((p) => p.createdAt)
    expect(sale).toEqual([...sale].sort().reverse())
  })
})

describe('catalogue data integrity', () => {
  it('has unique slugs and no made-to-order kind', () => {
    expect(new Set(all.map((p) => p.slug)).size).toBe(48)
    expect(all.some((p) => 'kind' in p)).toBe(false)
  })

  it('has fashion sizes, colours, highlights and prices in range', () => {
    expect(all.every((p) => p.sizes.join() === 'S,M,L,XL,XXL' && p.colors.length >= 3 && p.colors.length <= 5 && p.highlights.length === 4)).toBe(true)
    expect(all.every((p) => p.price >= 189000 && p.price <= 459000 && Number.isInteger(p.price))).toBe(true)
    expect(all.every((p) => getCategory(p.categorySlug) !== null)).toBe(true)
  })

  it('gives each product its own frozen highlights array', () => {
    expect(all[0].highlights).not.toBe(all[1].highlights)
    expect(new Set(all.map((p) => p.highlights)).size).toBe(all.length)
    expect(all.every((p) => Object.isFrozen(p.highlights))).toBe(true)
  })

  it('names only the dresses with the word Đầm', () => {
    for (const p of all) expect(p.name.includes('Đầm')).toBe(p.categorySlug === 'dam')
  })

  it('pins the first shirt as the shared fixture product', () => {
    const first = listProducts({ categorySlug: 'ao' }).items[0]
    expect([first.price, first.compareAtPrice]).toEqual([229000, 289000])
  })

  it('puts sale prices sixty thousand above the price', () => {
    for (const p of all.filter((x) => x.compareAtPrice !== null)) expect(p.compareAtPrice).toBe(p.price + 60000)
  })

  it('returns related products excluding itself', () => {
    const related = getRelatedProducts(all[0])
    expect(related.some((p) => p.id === all[0].id)).toBe(false)
    expect(related.length).toBeLessThanOrEqual(8)
  })

  it('exposes the exact sort labels', () => {
    expect(Object.values(SORT_LABELS)).toContain('Sắp xếp theo giá: thấp đến cao')
  })
})
