import { describe, expect, it } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { computeTotals } from './totals'
import type { CartLine } from './types'

const A = listProducts({ categorySlug: 'ao' }).items[0]
const line = (q: number): CartLine => ({ productId: A.id, size: 'M', color: A.colors[0].name, quantity: q })

describe('computeTotals', () => {
  it('is all zero for an empty cart', () => {
    expect(computeTotals([])).toMatchObject({ itemCount: 0, subtotal: 0, shipping: 0, total: 0 })
  })

  it('charges shipping below the free-shipping threshold', () => {
    expect(computeTotals([line(2)])).toMatchObject({ itemCount: 2, subtotal: 458000, shipping: 30000, total: 488000 })
    expect(computeTotals([line(8)]).shipping).toBe(30000)
  })

  it('is free at 9 items', () => {
    expect(computeTotals([line(9)])).toMatchObject({ subtotal: 2061000, shipping: 0, total: 2061000 })
  })

  it('skips lines whose product no longer exists', () => {
    expect(computeTotals([{ ...line(1), productId: 'GONE' }]).lines).toEqual([])
  })
})
