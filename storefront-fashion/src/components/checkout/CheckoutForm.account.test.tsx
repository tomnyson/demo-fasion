import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '@/components/cart/CartProvider'
import type { Address } from '@/lib/addresses/schema'
import { postJson } from '@/lib/http/client'
import { line } from '@/lib/orders/fixtures'
import { CheckoutForm } from './CheckoutForm'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/lib/http/client', () => ({ postJson: vi.fn() }))

const post = vi.mocked(postJson)
const failure = (fields: Record<string, string>) => ({ success: false, data: null, error: { code: 'VALIDATION', message: 'x', fields } }) as const

const address = (id: string, recipient: string, isDefault: boolean): Address => ({
  id,
  userId: 'u1',
  recipient,
  phone: '0912345678',
  province: 'Đà Nẵng',
  address: `${id} Bạch Đằng`,
  isDefault,
  createdAt: '2026-11-18T03:00:00.000Z',
})
const BOOK = [address('a1', 'Trần Thị B', true), address('a2', 'Lê Văn C', false)]

const renderForm = (addresses: readonly Address[]) =>
  render(
    <CartProvider>
      <CheckoutForm account={{ addresses }} />
    </CartProvider>,
  )

beforeEach(() => {
  post.mockReset()
  post.mockResolvedValue(failure({}))
  localStorage.setItem('la-studio-cart-v1', JSON.stringify([line(2)]))
})

describe('CheckoutForm for a signed-in customer', () => {
  it('preselects the default address and sends only its id with email and note', async () => {
    renderForm(BOOK)
    expect(await screen.findByRole('radio', { name: /Trần Thị B/ })).toHaveProperty('checked', true)
    expect(screen.queryByLabelText('Họ và tên')).toBeNull()
    expect(screen.queryByLabelText('Lưu vào sổ địa chỉ')).toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: /Lê Văn C/ }))
    await userEvent.type(screen.getByLabelText('Ghi chú'), 'Gọi trước')
    await userEvent.click(screen.getByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(post).toHaveBeenCalledWith('/api/orders', {
      addressId: 'a2',
      customer: { email: '', note: 'Gọi trước' },
      payment: 'cod',
      lines: [line(2)],
      couponCode: '',
    })
  })

  it('shows the recipient fields for another address and can save it to the book', async () => {
    renderForm(BOOK)
    await userEvent.click(await screen.findByRole('radio', { name: 'Giao tới địa chỉ khác' }))
    await userEvent.type(screen.getByLabelText('Họ và tên'), 'Nguyễn Văn A')
    await userEvent.type(screen.getByLabelText('Số điện thoại'), '0901234567')
    await userEvent.selectOptions(screen.getByLabelText('Tỉnh/Thành phố'), 'Hà Nội')
    await userEvent.type(screen.getByLabelText('Địa chỉ'), '12 Đường Mẫu')
    await userEvent.click(screen.getByLabelText('Lưu vào sổ địa chỉ'))
    await userEvent.click(screen.getByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(post).toHaveBeenCalledWith('/api/orders', {
      customer: { name: 'Nguyễn Văn A', phone: '0901234567', email: '', province: 'Hà Nội', address: '12 Đường Mẫu', note: '' },
      payment: 'cod',
      lines: [line(2)],
      couponCode: '',
      saveAddress: true,
    })
  })

  it('shows the fields and the save checkbox directly when the book is empty', async () => {
    renderForm([])
    expect(await screen.findByLabelText('Họ và tên')).toBeTruthy()
    expect(screen.queryByRole('radio', { name: 'Giao tới địa chỉ khác' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(post).toHaveBeenCalledWith('/api/orders', expect.not.objectContaining({ saveAddress: true }))
  })

  it('shows an address error next to the picker without a generic alert', async () => {
    post.mockResolvedValue(failure({ addressId: 'Địa chỉ giao hàng không hợp lệ.' }))
    renderForm(BOOK)
    await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.map((a) => a.textContent)).toEqual(['Địa chỉ giao hàng không hợp lệ.'])
  })
})
