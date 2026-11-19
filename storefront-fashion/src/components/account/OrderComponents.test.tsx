import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderLines } from '@/components/orders/OrderLines'
import { postJson } from '@/lib/http/client'
import { storedOrder } from '@/lib/orders/fixtures'
import { CancelOrderButton } from './CancelOrderButton'
import { OrderList } from './OrderList'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderTimeline, timelineSteps } from './OrderTimeline'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('@/lib/http/client', () => ({ postJson: vi.fn() }))
const post = vi.mocked(postJson)

const LINE = { productId: 'p1', name: 'Áo Lụa', size: 'M', color: 'Kem', quantity: 2, unitPrice: 229000, lineTotal: 458000 }
const T0 = '2026-11-18T03:00:00.000Z'
const T1 = '2026-11-18T05:30:00.000Z'

beforeEach(() => {
  refresh.mockClear()
  post.mockReset()
})

describe('OrderList', () => {
  it('shows the empty state with a shopping link', () => {
    render(<OrderList orders={[]} />)
    expect(screen.getByText('Bạn chưa có đơn hàng nào.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'MUA SẮM NGAY' }).getAttribute('href')).toBe('/danh-muc/ao')
  })

  it('lists code, date, item count, total and status, linking to the detail', () => {
    render(<OrderList orders={[storedOrder('LS-261118-AAAAAAAA', { lines: [LINE, { ...LINE, quantity: 1 }], total: 717000, status: 'shipping' })]} />)
    const link = screen.getByRole('link', { name: /LS-261118-AAAAAAAA/ })
    expect(link.getAttribute('href')).toBe('/tai-khoan/don-hang/LS-261118-AAAAAAAA')
    expect(link.textContent).toContain('18/11/2026 · 3 sản phẩm')
    expect(link.textContent).toContain('717.000 ₫')
    expect(within(link).getByText('Đang giao')).toBeTruthy()
  })
})

describe('OrderStatusBadge', () => {
  it('shows the Vietnamese label', () => {
    render(<OrderStatusBadge status="cancelled" />)
    expect(screen.getByText('Đã huỷ').getAttribute('data-status')).toBe('cancelled')
  })
})

describe('OrderTimeline', () => {
  it('shows reached steps with times and the steps still ahead', () => {
    render(<OrderTimeline status="confirmed" history={[{ status: 'pending', at: T0 }, { status: 'confirmed', at: T1 }]} />)
    const items = within(screen.getByRole('list', { name: 'Tiến trình đơn hàng' })).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual(['Chờ xác nhận10:00 18/11/2026', 'Đã xác nhận12:30 18/11/2026', 'Đang giao', 'Đã giao'])
  })

  it('stops at the cancellation', () => {
    expect(timelineSteps('cancelled', [{ status: 'pending', at: T0 }, { status: 'cancelled', at: T1 }]).map((s) => s.status)).toEqual(['pending', 'cancelled'])
  })
})

describe('OrderLines', () => {
  it('shows the discount line with the coupon code, and free shipping', () => {
    render(<OrderLines order={{ lines: [LINE], subtotal: 458000, discount: 45800, couponCode: 'LASTUDIO10', shipping: 0, total: 412200 }} />)
    expect(screen.getByText('Giảm giá (LASTUDIO10)')).toBeTruthy()
    expect(screen.getByTestId('order-discount').textContent).toBe('−45.800 ₫')
    expect(screen.getByText('Miễn phí')).toBeTruthy()
  })

  it('hides the discount line for orders without one', () => {
    render(<OrderLines order={{ lines: [LINE], subtotal: 458000, shipping: 30000, total: 488000 }} />)
    expect(screen.queryByTestId('order-discount')).toBeNull()
    expect(screen.getByText('30.000 ₫')).toBeTruthy()
  })
})

describe('CancelOrderButton', () => {
  it('asks for confirmation, cancels and refreshes', async () => {
    post.mockResolvedValue({ success: true, data: { code: 'C' }, error: null })
    render(<CancelOrderButton code="LS-261118-AAAAAAAA" />)
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ đơn' }))
    await userEvent.click(screen.getByRole('button', { name: 'Không' }))
    expect(post).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ đơn' }))
    await userEvent.click(within(screen.getByRole('group', { name: 'Xác nhận huỷ đơn' })).getByRole('button', { name: 'Huỷ đơn' }))
    expect(post).toHaveBeenCalledWith('/api/account/orders/LS-261118-AAAAAAAA/cancel', undefined)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('shows the server’s reason when the shop already confirmed', async () => {
    post.mockResolvedValue({ success: false, data: null, error: { code: 'CONFLICT', message: 'Đơn đã được xác nhận, vui lòng liên hệ shop để huỷ.' } })
    render(<CancelOrderButton code="LS-261118-AAAAAAAA" />)
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ đơn' }))
    await userEvent.click(within(screen.getByRole('group')).getByRole('button', { name: 'Huỷ đơn' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Đơn đã được xác nhận, vui lòng liên hệ shop để huỷ.')
    expect(refresh).not.toHaveBeenCalled()
  })
})
