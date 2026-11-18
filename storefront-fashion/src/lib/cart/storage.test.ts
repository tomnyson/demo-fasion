import { afterEach, describe, expect, it, vi } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { loadCart, saveCart } from './storage'
import type { CartLine } from './types'

const A = listProducts({ categorySlug: 'ao' }).items[0]
const line = (q: number): CartLine => ({ productId: A.id, size: 'M', color: A.colors[0].name, quantity: q })
const store = (v: string | null) => ({ getItem: () => v })

afterEach(() => vi.restoreAllMocks())

describe('loadCart', () => {
  it('returns empty for missing or malformed data', () => {
    expect(loadCart(store(null))).toEqual([])
    expect(loadCart(store('{not json'))).toEqual([])
    expect(loadCart(store('{"a":1}'))).toEqual([])
  })

  it('drops unknown products, bad sizes and bad quantities', () => {
    expect(loadCart(store(JSON.stringify([line(2), { productId: 'GONE', size: 'M', color: 'x', quantity: 1 }])))).toEqual([line(2)])
    expect(loadCart(store(JSON.stringify([{ ...line(1), size: 'XXXL' }])))).toEqual([])
    expect(loadCart(store(JSON.stringify([{ ...line(1), color: 'khong-co' }])))).toEqual([])
    expect(loadCart(store(JSON.stringify([{ ...line(1), quantity: -4 }, { ...line(1), quantity: 'x' }])))).toEqual([])
  })

  it('drops lines from the old shop and the removed Free size', () => {
    expect(loadCart(store(JSON.stringify([{ productId: 'ENO-BD-01', size: 'M', color: 'Đỏ', quantity: 2 }])))).toEqual([])
    expect(loadCart(store(JSON.stringify([{ productId: A.id, size: 'Free', color: A.colors[0].name, quantity: 1 }])))).toEqual([])
  })

  it('keeps a line for any product that has the chosen size and colour', () => {
    const anyProduct = listProducts({ pageSize: 48 }).items.at(-1)!
    expect(loadCart(store(JSON.stringify([{ productId: anyProduct.id, size: anyProduct.sizes[0], color: anyProduct.colors[0].name, quantity: 1 }])))).toHaveLength(1)
  })

  it('merges duplicate keys and clamps', () => {
    expect(loadCart(store(JSON.stringify([line(60), line(60)])))).toEqual([line(99)])
  })

  it('returns empty when storage access throws', () => {
    expect(loadCart({ getItem: () => { throw new Error('denied') } })).toEqual([])
  })
})

describe('saveCart', () => {
  it('writes JSON under the cart key', () => {
    const setItem = vi.fn()
    saveCart({ setItem }, [line(1)])
    expect(setItem).toHaveBeenCalledWith('la-studio-cart-v1', JSON.stringify([line(1)]))
  })

  it('swallows storage errors after warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => saveCart({ setItem: () => { throw new Error('quota') } }, [line(1)])).not.toThrow()
    expect(warn).toHaveBeenCalled()
  })
})
