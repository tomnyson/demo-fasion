import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { CartProvider, useCart } from './CartProvider'

const A = listProducts({ categorySlug: 'ao' }).items[0]

function Probe() {
  const { totals, hydrated, add } = useCart()
  return (
    <div>
      <span>items:{totals.itemCount}</span>
      <span>{hydrated ? 'hydrated' : 'pending'}</span>
      <button type="button" onClick={() => add({ productId: A.id, size: 'M', color: A.colors[0].name, quantity: 1 })}>
        add
      </button>
    </div>
  )
}

afterEach(() => vi.restoreAllMocks())

describe('CartProvider', () => {
  it('treats corrupt storage as empty, then persists changes', async () => {
    localStorage.setItem('la-studio-cart-v1', '{broken')
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    )
    await screen.findByText('items:0')
    await userEvent.click(screen.getByRole('button', { name: 'add' }))
    await screen.findByText('items:1')
    expect(JSON.parse(localStorage.getItem('la-studio-cart-v1')!)).toHaveLength(1)
  })

  it('loads a stored cart without overwriting it first', async () => {
    const stored = [{ productId: A.id, size: 'M', color: A.colors[0].name, quantity: 3 }]
    localStorage.setItem('la-studio-cart-v1', JSON.stringify(stored))
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    )
    await screen.findByText('items:3')
    expect(JSON.parse(localStorage.getItem('la-studio-cart-v1')!)).toEqual(stored)
  })

  it('ignores a cart saved under the old shop key', async () => {
    localStorage.setItem('old-shop-cart-v1', JSON.stringify([{ productId: A.id, size: 'M', color: A.colors[0].name, quantity: 3 }]))
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    )
    await screen.findByText('items:0')
  })

  it('throws when useCart is used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/CartProvider/)
  })
})
