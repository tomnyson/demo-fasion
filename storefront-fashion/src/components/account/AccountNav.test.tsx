import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendJson } from '@/lib/http/client'
import { hardNavigate } from '@/lib/navigation/hard-navigate'
import { AccountNav } from './AccountNav'

const path = vi.hoisted(() => ({ value: '/tai-khoan' }))
vi.mock('next/navigation', () => ({ usePathname: () => path.value }))
vi.mock('@/lib/http/client', () => ({ sendJson: vi.fn() }))
vi.mock('@/lib/navigation/hard-navigate', () => ({ hardNavigate: vi.fn() }))

const send = vi.mocked(sendJson)
const navigate = vi.mocked(hardNavigate)

beforeEach(() => {
  send.mockReset()
  navigate.mockReset()
})

const current = () => screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page').map((link) => link.textContent)

describe('AccountNav', () => {
  it('links every section and marks only the exact profile page as current', () => {
    path.value = '/tai-khoan'
    render(<AccountNav />)
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/tai-khoan', '/tai-khoan/dia-chi', '/tai-khoan/don-hang'])
    expect(current()).toEqual(['Hồ sơ'])
  })

  it('marks a section for its sub-pages', () => {
    path.value = '/tai-khoan/don-hang/LS-123'
    render(<AccountNav />)
    expect(current()).toEqual(['Đơn hàng'])
  })

  it('signs out, then does a full load of the home page', async () => {
    send.mockResolvedValue({ success: true, data: { signedOut: true }, error: null })
    render(<AccountNav />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đăng xuất' }))
    expect(send).toHaveBeenCalledWith('POST', '/api/auth/logout')
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('shows an error when sign-out fails', async () => {
    send.mockResolvedValue({ success: false, data: null, error: { code: 'INTERNAL', message: 'Không thể kết nối.' } })
    render(<AccountNav />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đăng xuất' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Không thể kết nối.')
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toHaveProperty('disabled', false)
  })
})
