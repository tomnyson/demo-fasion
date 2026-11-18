import { describe, expect, it } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { cartReducer } from './reducer'
import { lineKey, type CartLine } from './types'

const A = listProducts({ categorySlug: 'ao' }).items[0]
const line = (q: number): CartLine => ({ productId: A.id, size: 'M', color: A.colors[0].name, quantity: q })

describe('cartReducer', () => {
  it('adds a line and merges quantities without mutating', () => {
    const s1 = cartReducer([], { type: 'add', line: line(2) })
    expect(s1).toEqual([line(2)])
    const s2 = cartReducer(s1, { type: 'add', line: line(3) })
    expect(s2).toEqual([line(5)])
    expect(s1).toEqual([line(2)])
  })

  it('keeps different sizes as separate lines', () => {
    const s1 = cartReducer([], { type: 'add', line: line(2) })
    expect(cartReducer(s1, { type: 'add', line: { ...line(1), size: 'L' } })).toHaveLength(2)
  })

  it('clamps merged quantity to the maximum', () => {
    expect(cartReducer([line(98)], { type: 'add', line: line(5) })[0].quantity).toBe(99)
  })

  it('sets quantity within 1..99 and ignores non-integers', () => {
    const s1 = cartReducer([], { type: 'add', line: line(2) })
    const k = lineKey(line(1))
    expect(cartReducer(s1, { type: 'setQuantity', key: k, quantity: 0 })[0].quantity).toBe(1)
    expect(cartReducer(s1, { type: 'setQuantity', key: k, quantity: 500 })[0].quantity).toBe(99)
    expect(cartReducer(s1, { type: 'setQuantity', key: k, quantity: 2.5 })).toBe(s1)
    expect(cartReducer(s1, { type: 'setQuantity', key: 'nope', quantity: 3 })).toBe(s1)
  })

  it('removes, clears and hydrates', () => {
    const s1 = cartReducer([], { type: 'add', line: line(2) })
    const k = lineKey(line(1))
    expect(cartReducer(s1, { type: 'remove', key: 'nope' })).toBe(s1)
    expect(cartReducer(s1, { type: 'remove', key: k })).toEqual([])
    expect(cartReducer(s1, { type: 'clear' })).toEqual([])
    expect(cartReducer([], { type: 'hydrate', lines: [line(4)] })).toEqual([line(4)])
  })
})
