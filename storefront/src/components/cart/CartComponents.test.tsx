import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { computeTotals } from '@/lib/cart/totals'
import type { CartLine } from '@/lib/cart/types'
import { CartIcon } from './CartIcon'
import { CartProvider, useCart } from './CartProvider'
import { CartSummary } from './CartSummary'
import { CartTable } from './CartTable'

const PRODUCT = listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).items[0]
const line = (quantity: number): CartLine => ({ productId: PRODUCT.id, size: 'M', color: PRODUCT.colors[0].name, quantity })

function AddThree() {
  const { add } = useCart()
  return <button type="button" onClick={() => add(line(3))}>add three</button>
}

describe('CartIcon', () => {
  it('labels the link with the item count and shows a badge only when the cart has items', async () => {
    render(
      <CartProvider>
        <CartIcon />
        <AddThree />
      </CartProvider>,
    )
    const link = await screen.findByRole('link', { name: 'Giỏ hàng, 0 sản phẩm' })
    expect(link.getAttribute('href')).toBe('/gio-hang')
    expect(link.textContent).toBe('')
    await userEvent.click(screen.getByRole('button', { name: 'add three' }))
    const updated = await screen.findByRole('link', { name: 'Giỏ hàng, 3 sản phẩm' })
    expect(updated.textContent).toBe('3')
  })
})

describe('CartSummary', () => {
  it('shows shipping fee, total and how many more items earn free shipping', () => {
    render(<CartSummary totals={computeTotals([line(2)])} />)
    expect(screen.getByTestId('cart-total').textContent).toBe('288.000 ₫')
    expect(screen.getByText('30.000 ₫')).toBeTruthy()
    expect(screen.getByText('Mua thêm 7 sản phẩm để được miễn phí giao hàng.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'TIẾN HÀNH THANH TOÁN' }).getAttribute('href')).toBe('/thanh-toan')
  })

  it('shows free shipping and no hint from nine items', () => {
    render(<CartSummary totals={computeTotals([line(9)])} />)
    expect(screen.getByText('Miễn phí')).toBeTruthy()
    expect(screen.queryByText(/Mua thêm/)).toBeNull()
  })
})

describe('CartTable', () => {
  it('renders each line and reports quantity changes and removal by line key', async () => {
    const onQuantity = vi.fn()
    const onRemove = vi.fn()
    const totals = computeTotals([line(2)])
    render(<CartTable lines={totals.lines} onQuantity={onQuantity} onRemove={onRemove} />)
    const row = screen.getAllByRole('row')[1]
    expect(within(row).getByRole('link', { name: PRODUCT.name }).getAttribute('href')).toBe(`/san-pham/${PRODUCT.slug}`)
    expect(within(row).getByText('M')).toBeTruthy()
    await userEvent.click(within(row).getByRole('button', { name: 'Tăng số lượng' }))
    expect(onQuantity).toHaveBeenCalledWith(totals.lines[0].key, 3)
    await userEvent.click(within(row).getByRole('button', { name: 'Xoá' }))
    expect(onRemove).toHaveBeenCalledWith(totals.lines[0].key)
  })

  it('falls back to the first colour image when the line colour is unknown', () => {
    const totals = computeTotals([{ ...line(1), color: 'Màu không tồn tại' }])
    render(<CartTable lines={totals.lines} onQuantity={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText('Màu không tồn tại')).toBeTruthy()
  })
})
