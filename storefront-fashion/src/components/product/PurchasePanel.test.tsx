import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '@/components/cart/CartProvider'
import { listProducts } from '@/lib/catalog/repository'
import { PurchasePanel } from './PurchasePanel'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const A = listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).items[0]

function Harness({ onColor }: { readonly onColor?: (i: number) => void }) {
  const [index, setIndex] = useState(0)
  return (
    <CartProvider>
      <PurchasePanel
        product={A}
        activeColorIndex={index}
        onColorChange={(i) => {
          setIndex(i)
          onColor?.(i)
        }}
      />
    </CartProvider>
  )
}

beforeEach(() => push.mockClear())

describe('PurchasePanel', () => {
  it('refuses to add without a size', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'THÊM VÀO GIỎ' }))
    expect(screen.getByText('Vui lòng chọn size.')).toBeTruthy()
    expect(localStorage.getItem('la-studio-cart-v1') ?? '[]').toBe('[]')
    await userEvent.click(screen.getByRole('button', { name: 'MUA NGAY' }))
    expect(push).not.toHaveBeenCalled()
  })

  it('adds the chosen size and quantity, then buys now', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'L' }))
    await userEvent.click(screen.getByRole('button', { name: 'Tăng số lượng' }))
    await userEvent.click(screen.getByRole('button', { name: 'THÊM VÀO GIỎ' }))
    expect(await screen.findByText('Đã thêm vào giỏ hàng')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('la-studio-cart-v1')!)[0]).toMatchObject({ size: 'L', quantity: 2 })
    await userEvent.click(screen.getByRole('button', { name: 'MUA NGAY' }))
    expect(push).toHaveBeenCalledWith('/thanh-toan')
  })

  it('reports colour changes and keeps the quantity within 1..99', async () => {
    const onColor = vi.fn()
    render(<Harness onColor={onColor} />)
    await userEvent.click(screen.getAllByRole('radio', { name: A.colors[A.colors.length - 1].name })[0])
    expect(onColor).toHaveBeenCalledWith(A.colors.length - 1)
    await userEvent.click(screen.getByRole('button', { name: 'Giảm số lượng' }))
    expect(screen.getByLabelText('Số lượng')).toHaveProperty('value', '1')
  })
})
