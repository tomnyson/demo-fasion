import { describe, expect, it } from 'vitest'
import {
  SORT_LABELS,
  getCategories,
  getCategory,
  getProduct,
  getRelatedProducts,
  listProducts,
} from '@/lib/catalog/repository'

describe('catalogue data integrity', () => {
  it('gives every product four highlights', () => {
    for (const product of listProducts({ pageSize: 64 }).items) expect(product.highlights).toHaveLength(4)
  })
})

describe('catalogue listing', () => {
  it('has the expected category and product counts', () => {
    expect(getCategories()).toHaveLength(14)
    expect(listProducts({}).total).toBe(64)
    expect(listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).total).toBe(20)
    expect(listProducts({ categorySlug: 'ao-bong-da' }).total).toBe(28) // parent includes children
    expect(listProducts({ categorySlug: 'phu-kien' }).total).toBe(16)
  })

  it('paginates and clamps the page', () => {
    const p1 = listProducts({ categorySlug: 'ao-bong-da' })
    expect([p1.items.length, p1.pageCount, p1.from, p1.to]).toEqual([16, 2, 1, 16])
    const p2 = listProducts({ categorySlug: 'ao-bong-da', page: 2 })
    expect([p2.items.length, p2.from, p2.to]).toEqual([12, 17, 28])
    expect(listProducts({ categorySlug: 'ao-bong-da', page: 999 }).page).toBe(2) // clamp
  })

  it('sorts by price ascending', () => {
    const asc = listProducts({ sort: 'price-asc', pageSize: 64 }).items.map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
  })

  it('searches ignoring case and diacritics', () => {
    expect(listProducts({ query: 'ao bong da' }).total).toBe(28) // no diacritics
    expect(listProducts({ query: '  ÁO BÓNG ĐÁ ' }).total).toBe(28)
  })

  it('reports an empty result consistently', () => {
    const none = listProducts({ query: 'zzzz' })
    expect([none.total, none.pageCount, none.from, none.to]).toEqual([0, 1, 0, 0])
  })

  it('returns null for unknown slugs', () => {
    expect(getProduct('khong-ton-tai')).toBeNull()
    expect(getCategory('khong-ton-tai')).toBeNull()
  })
})

describe('catalogue data integrity', () => {
  const all = listProducts({ pageSize: 64 }).items

  it('has unique slugs and 36 ready products', () => {
    expect(new Set(all.map((p) => p.slug)).size).toBe(64)
    expect(all.filter((p) => p.kind === 'ready')).toHaveLength(36)
  })

  it('has valid prices, colours, sizes and categories', () => {
    expect(all.every((p) => Number.isInteger(p.price) && p.price > 0 && p.colors.length >= 1 && p.sizes.length >= 1)).toBe(true)
    expect(all.every((p) => getCategory(p.categorySlug) !== null)).toBe(true)
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
