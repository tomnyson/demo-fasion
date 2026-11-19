import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postJson } from '@/lib/http/client'
import { hardNavigate } from '@/lib/navigation/hard-navigate'
import { AuthForm } from './AuthForm'

vi.mock('@/lib/http/client', () => ({ postJson: vi.fn() }))
vi.mock('@/lib/navigation/hard-navigate', () => ({ hardNavigate: vi.fn() }))

const post = vi.mocked(postJson)
const navigate = vi.mocked(hardNavigate)
const success = { success: true, data: { user: {} }, error: null } as const

beforeEach(() => {
  post.mockReset()
  navigate.mockReset()
})

describe('AuthForm', () => {
  it('logs in with email and password, then does a full load of the next page', async () => {
    post.mockResolvedValue(success)
    const user = userEvent.setup()
    render(<AuthForm mode="login" next="/thanh-toan" />)
    await user.type(screen.getByLabelText('Email'), 'lan@example.com')
    await user.type(screen.getByLabelText('Mật khẩu'), 'mat-khau-123')
    await user.click(screen.getByRole('button', { name: 'ĐĂNG NHẬP' }))
    expect(post).toHaveBeenCalledWith('/api/auth/login', { email: 'lan@example.com', password: 'mat-khau-123' })
    expect(navigate).toHaveBeenCalledWith('/thanh-toan')
    expect(screen.getByLabelText('Mật khẩu').getAttribute('type')).toBe('password')
  })

  it('shows the shared credentials error as a form alert', async () => {
    post.mockResolvedValue({ success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng.' } })
    const user = userEvent.setup()
    render(<AuthForm mode="login" next="/tai-khoan" />)
    await user.click(screen.getByRole('button', { name: 'ĐĂNG NHẬP' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Email hoặc mật khẩu không đúng.')
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'ĐĂNG NHẬP' })).toHaveProperty('disabled', false)
  })

  it('registers with all fields and marks field errors', async () => {
    post.mockResolvedValueOnce({ success: false, data: null, error: { code: 'VALIDATION', message: 'x', fields: { email: 'Email đã được sử dụng.' } } })
    const user = userEvent.setup()
    render(<AuthForm mode="register" next="/tai-khoan" />)
    for (const label of ['Họ và tên', 'Email', 'Số điện thoại (không bắt buộc)', 'Mật khẩu (8–72 ký tự)']) expect(screen.getByLabelText(label)).toBeTruthy()
    await user.type(screen.getByLabelText('Họ và tên'), 'Lan')
    await user.click(screen.getByRole('button', { name: 'TẠO TÀI KHOẢN' }))
    expect(post).toHaveBeenCalledWith('/api/auth/register', { name: 'Lan', email: '', phone: '', password: '' })
    expect(await screen.findByText('Email đã được sử dụng.')).toBeTruthy()
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('links to the other form and keeps next', () => {
    render(<AuthForm mode="login" next="/tai-khoan/don-hang" />)
    expect(screen.getByRole('link', { name: 'Đăng ký' }).getAttribute('href')).toBe('/dang-ky?next=%2Ftai-khoan%2Fdon-hang')
  })

  it('ignores a second submit while one is in flight', async () => {
    let resolve: (value: typeof success) => void = () => undefined
    post.mockReturnValue(new Promise((r) => { resolve = r }))
    const user = userEvent.setup()
    render(<AuthForm mode="register" next="/tai-khoan" />)
    const button = screen.getByRole('button', { name: 'TẠO TÀI KHOẢN' })
    await user.click(button)
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toHaveProperty('disabled', true)
    screen.getByRole('button', { name: 'Đang xử lý…' }).closest('form')!.requestSubmit()
    expect(post).toHaveBeenCalledTimes(1)
    resolve(success)
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/tai-khoan'))
  })
})
