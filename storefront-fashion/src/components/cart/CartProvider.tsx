'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { cartReducer } from '@/lib/cart/reducer'
import { loadCart, saveCart } from '@/lib/cart/storage'
import { computeTotals, type CartTotals } from '@/lib/cart/totals'
import type { CartAction, CartLine } from '@/lib/cart/types'

export interface CartContextValue {
  readonly lines: readonly CartLine[]
  readonly totals: CartTotals
  readonly hydrated: boolean
  add(line: CartLine): void
  setQuantity(key: string, quantity: number): void
  remove(key: string): void
  clear(): void
}

interface CartStore {
  readonly lines: readonly CartLine[]
  readonly hydrated: boolean
}

const INITIAL_STORE: CartStore = { lines: [], hydrated: false }

function storeReducer(store: CartStore, action: CartAction): CartStore {
  const lines = cartReducer(store.lines, action)
  const hydrated = store.hydrated || action.type === 'hydrate'
  return lines === store.lines && hydrated === store.hydrated ? store : { lines, hydrated }
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { readonly children: ReactNode }) {
  const [{ lines, hydrated }, dispatch] = useReducer(storeReducer, INITIAL_STORE)

  useEffect(() => {
    dispatch({ type: 'hydrate', lines: loadCart(window.localStorage) })
  }, [])

  useEffect(() => {
    if (hydrated) saveCart(window.localStorage, lines)
  }, [hydrated, lines])

  const add = useCallback((line: CartLine) => dispatch({ type: 'add', line }), [])
  const setQuantity = useCallback((key: string, quantity: number) => dispatch({ type: 'setQuantity', key, quantity }), [])
  const remove = useCallback((key: string) => dispatch({ type: 'remove', key }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(
    () => ({ lines, totals: computeTotals(lines), hydrated, add, setQuantity, remove, clear }),
    [lines, hydrated, add, setQuantity, remove, clear],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (context === null) throw new Error('useCart phải được dùng bên trong CartProvider')
  return context
}
