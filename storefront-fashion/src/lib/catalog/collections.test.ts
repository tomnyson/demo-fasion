import { describe, expect, it } from 'vitest'
import { COLLECTIONS, inCollection, isOnSale } from './collections'
import { listProducts } from './repository'

const all = listProducts({ pageSize: 48 }).items

describe('isOnSale', () => {
  it('is true only when the compare-at price is higher than the price', () => {
    expect(isOnSale({ ...all[0], price: 200000, compareAtPrice: 260000 })).toBe(true)
    expect(isOnSale({ ...all[0], compareAtPrice: null })).toBe(false)
    expect(isOnSale({ ...all[0], price: 200000, compareAtPrice: 200000 })).toBe(false)
  })
})

describe('collections', () => {
  it('lists the four collections with their names', () => {
    expect(COLLECTIONS.map((c) => [c.slug, c.name])).toEqual([
      ['noi-bat', 'Sản phẩm nổi bật'],
      ['best-seller', 'Best seller'],
      ['hang-moi', 'Hàng mới về'],
      ['sale', 'Sale'],
    ])
  })

  it('matches products by tag, and sale by price', () => {
    const tagged = { ...all[0], tags: ['featured' as const], price: 100000, compareAtPrice: null }
    expect(inCollection(tagged, 'noi-bat')).toBe(true)
    expect(inCollection(tagged, 'best-seller')).toBe(false)
    expect(inCollection(tagged, 'hang-moi')).toBe(false)
    expect(inCollection(tagged, 'sale')).toBe(false)
    expect(inCollection({ ...tagged, tags: ['best-seller'] }, 'best-seller')).toBe(true)
    expect(inCollection({ ...tagged, tags: ['new'] }, 'hang-moi')).toBe(true)
    expect(inCollection({ ...tagged, compareAtPrice: 160000 }, 'sale')).toBe(true)
  })
})
