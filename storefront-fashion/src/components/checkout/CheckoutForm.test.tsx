import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '@/components/cart/CartProvider'
import { postJson } from '@/lib/http/client'
import { line } from '@/lib/orders/fixtures'
import { CheckoutForm } from './CheckoutForm'

const replace = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/lib/http/client', () => ({ postJson: vi.fn() }))

const post = vi.mocked(postJson)

const failure = (code: 'VALIDATION' | 'RATE_LIMITED', message: string, fields?: Record<string, string>) =>
  ({ success: false, data: null, error: { code, message, fields } }) as const

function renderForm() {
  return render(
    <CartProvider>
      <CheckoutForm />
    </CartProvider>,
  )
}

beforeEach(() => {
  replace.mockClear()
  post.mockReset()
  localStorage.setItem('la-studio-cart-v1', JSON.stringify([line(2)]))
})

describe('CheckoutForm', () => {
  it('shows the empty state without a form when the cart is empty', async () => {
    localStorage.setItem('la-studio-cart-v1', '[]')
    renderForm()
    expect(await screen.findByText('Giỏ hàng của bạn đang trống.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'ĐẶT HÀNG' })).toBeNull()
    expect(screen.getByRole('link', { name: /TIẾP TỤC MUA SẮM/ }).getAttribute('href')).toBe('/danh-muc/ao')
  })

  it('renders labelled fields, COD by default and the order summary', async () => {
    renderForm()
    await screen.findByRole('button', { name: 'ĐẶT HÀNG' })
    for (const label of ['Họ và tên', 'Số điện thoại', 'Email (không bắt buộc)', 'Tỉnh/Thành phố', 'Địa chỉ', 'Ghi chú'])
      expect(screen.getByLabelText(label)).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Thanh toán khi nhận hàng (COD)' })).toHaveProperty('checked', true)
    expect(screen.getByRole('radio', { name: 'Chuyển khoản ngân hàng' })).toHaveProperty('checked', false)
    expect(screen.getByTestId('checkout-total').textContent).toBe('488.000 ₫')
  })

  it('leaves validation to the server and renders its field errors', async () => {
    post.mockResolvedValue(failure('VALIDATION', 'x', { 'customer.phone': 'Số điện thoại không hợp lệ.' }))
    renderForm()
    await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(post).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Số điện thoại không hợp lệ.')).toBeTruthy()
    const phone = screen.getByLabelText('Số điện thoại')
    expect(phone.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(phone.getAttribute('aria-describedby')!)?.textContent).toBe('Số điện thoại không hợp lệ.')
    expect(screen.getByLabelText('Họ và tên').getAttribute('aria-invalid')).toBeNull()
  })

  it('sends the typed values and cart lines, never prices', async () => {
    post.mockResolvedValue(failure('VALIDATION', 'x', {}))
    renderForm()
    await userEvent.type(await screen.findByLabelText('Họ và tên'), 'Nguyễn Văn A')
    await userEvent.type(screen.getByLabelText('Số điện thoại'), '0901234567')
    await userEvent.selectOptions(screen.getByLabelText('Tỉnh/Thành phố'), 'Hà Nội')
    await userEvent.type(screen.getByLabelText('Địa chỉ'), '12 Đường Mẫu')
    await userEvent.click(screen.getByRole('radio', { name: 'Chuyển khoản ngân hàng' }))
    await userEvent.click(screen.getByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(post).toHaveBeenCalledWith('/api/orders', {
      customer: { name: 'Nguyễn Văn A', phone: '0901234567', email: '', province: 'Hà Nội', address: '12 Đường Mẫu', note: '' },
      payment: 'bank',
      lines: [line(2)],
    })
  })

  it('disables the button while pending and ignores a second submit', async () => {
    post.mockReturnValue(new Promise(() => {}))
    renderForm()
    await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toHaveProperty('disabled', true)
    await userEvent.click(screen.getByRole('button', { name: 'Đang xử lý…' }))
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('shows a non-field error in an alert and re-enables the button', async () => {
    post.mockResolvedValue(failure('RATE_LIMITED', 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.'))
    renderForm()
    await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.')
    expect(screen.getByRole('button', { name: 'ĐẶT HÀNG' })).toHaveProperty('disabled', false)
  })

  it('shows a cart-level field error in the alert', async () => {
    post.mockResolvedValue(failure('VALIDATION', 'x', { lines: 'Giỏ hàng không hợp lệ.' }))
    renderForm()
    await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Giỏ hàng không hợp lệ.')
  })

  it('clears the cart and redirects on success', async () => {
    post.mockResolvedValue({ success: true, data: { code: 'LS-261118-AAAAAAAA' }, error: null })
    renderForm()
    await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/dat-hang-thanh-cong/LS-261118-AAAAAAAA'))
    await waitFor(() => expect(localStorage.getItem('la-studio-cart-v1')).toBe('[]'))
    expect(screen.queryByText('Giỏ hàng của bạn đang trống.')).toBeNull()
  })
})
