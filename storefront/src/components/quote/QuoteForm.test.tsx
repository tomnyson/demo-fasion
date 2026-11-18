import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postJson } from '@/lib/http/client'
import { QuoteForm } from './QuoteForm'

vi.mock('@/lib/http/client', () => ({ postJson: vi.fn() }))
const post = vi.mocked(postJson)

const sports = [
  { slug: 'ao-bong-da', name: 'Áo bóng đá' },
  { slug: 'ao-cau-long', name: 'Áo cầu lông' },
]
const failure = (code: 'VALIDATION' | 'RATE_LIMITED', message: string, fields?: Record<string, string>) =>
  ({ success: false, data: null, error: { code, message, fields } }) as const

beforeEach(() => {
  post.mockReset()
})

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Họ và tên'), 'Trần B')
  await userEvent.type(screen.getByLabelText('Số điện thoại'), '0901234567')
  await userEvent.selectOptions(screen.getByLabelText('Môn thể thao'), 'ao-cau-long')
  await userEvent.click(screen.getByRole('button', { name: 'GỬI YÊU CẦU' }))
}

describe('QuoteForm', () => {
  it('renders labelled fields, the product and the default quantity', () => {
    render(<QuoteForm sports={sports} product={{ slug: 'ao-x', name: 'Áo X' }} />)
    expect(screen.getByText('Sản phẩm quan tâm: Áo X')).toBeTruthy()
    for (const label of ['Họ và tên', 'Số điện thoại', 'Môn thể thao', 'Nội dung yêu cầu']) expect(screen.getByLabelText(label)).toBeTruthy()
    const qty = screen.getByLabelText('Số lượng (bộ)') as HTMLInputElement
    expect(qty.value).toBe('10')
    expect(qty.type).toBe('number')
    expect(qty.min).toBe('5')
  })

  it('starts on the placeholder sport, or on the preselected one', () => {
    const { unmount } = render(<QuoteForm sports={sports} />)
    expect((screen.getByLabelText('Môn thể thao') as HTMLSelectElement).value).toBe('')
    unmount()
    render(<QuoteForm sports={sports} defaultSport="ao-cau-long" />)
    expect((screen.getByLabelText('Môn thể thao') as HTMLSelectElement).value).toBe('ao-cau-long')
  })

  it('sends the typed values and the product slug, then replaces the form with a status', async () => {
    post.mockResolvedValue({ success: true, data: { received: true }, error: null })
    render(<QuoteForm sports={sports} product={{ slug: 'ao-x', name: 'Áo X' }} />)
    await fillAndSubmit()
    expect(post).toHaveBeenCalledWith(
      '/api/quotes',
      expect.objectContaining({ name: 'Trần B', phone: '0901234567', sport: 'ao-cau-long', productSlug: 'ao-x', quantity: '10', message: '' }),
    )
    expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Đã nhận yêu cầu. Chúng tôi sẽ liên hệ trong 24 giờ.')
    expect(screen.queryByRole('button', { name: 'GỬI YÊU CẦU' })).toBeNull()
  })

  it('renders server field errors with aria wiring and leaves validation to the server', async () => {
    post.mockResolvedValue(failure('VALIDATION', 'x', { quantity: 'Số lượng tối thiểu là 5 bộ.' }))
    render(<QuoteForm sports={sports} />)
    await userEvent.clear(screen.getByLabelText('Số lượng (bộ)'))
    await userEvent.type(screen.getByLabelText('Số lượng (bộ)'), '3')
    await userEvent.click(screen.getByRole('button', { name: 'GỬI YÊU CẦU' }))
    expect(await screen.findByText('Số lượng tối thiểu là 5 bộ.')).toBeTruthy()
    const qty = screen.getByLabelText('Số lượng (bộ)')
    expect(qty.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(qty.getAttribute('aria-describedby')!)?.textContent).toBe('Số lượng tối thiểu là 5 bộ.')
    expect(screen.getByLabelText('Họ và tên').getAttribute('aria-invalid')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('disables the button while pending and ignores a second click', async () => {
    post.mockReturnValue(new Promise(() => {}))
    render(<QuoteForm sports={sports} />)
    await userEvent.click(screen.getByRole('button', { name: 'GỬI YÊU CẦU' }))
    expect(screen.getByRole('button', { name: 'Đang gửi…' })).toHaveProperty('disabled', true)
    await userEvent.click(screen.getByRole('button', { name: 'Đang gửi…' }))
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('shows a rate-limit error in an alert and keeps the typed values', async () => {
    post.mockResolvedValue(failure('RATE_LIMITED', 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.'))
    render(<QuoteForm sports={sports} />)
    await fillAndSubmit()
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.')
    expect((screen.getByLabelText('Họ và tên') as HTMLInputElement).value).toBe('Trần B')
    expect((screen.getByLabelText('Số điện thoại') as HTMLInputElement).value).toBe('0901234567')
    expect((screen.getByLabelText('Môn thể thao') as HTMLSelectElement).value).toBe('ao-cau-long')
    expect(screen.getByRole('button', { name: 'GỬI YÊU CẦU' })).toHaveProperty('disabled', false)
  })

  it('hides the message field when compact and omits it from the payload', async () => {
    post.mockResolvedValue(failure('VALIDATION', 'x', {}))
    render(<QuoteForm sports={sports} compact />)
    expect(screen.queryByLabelText('Nội dung yêu cầu')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'GỬI YÊU CẦU' }))
    expect(post.mock.calls[0][1]).not.toHaveProperty('message')
    expect(post.mock.calls[0][1]).not.toHaveProperty('productSlug')
  })
})
