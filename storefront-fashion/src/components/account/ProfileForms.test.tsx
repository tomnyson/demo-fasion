import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublicUser } from '@/lib/auth/users'
import { sendJson } from '@/lib/http/client'
import { PasswordForm, ProfileForm } from './ProfileForms'

vi.mock('@/lib/http/client', () => ({ sendJson: vi.fn() }))

const send = vi.mocked(sendJson)
const lan: PublicUser = { id: 'u1', email: 'lan@example.com', name: 'Lan Anh', phone: '0901234567', createdAt: '2026-11-19T00:00:00.000Z' }
const success = { success: true, data: { user: lan }, error: null } as const

beforeEach(() => send.mockReset())

describe('ProfileForm', () => {
  it('prefills the profile and saves name and phone', async () => {
    send.mockResolvedValue(success)
    const user = userEvent.setup()
    render(<ProfileForm user={lan} />)
    expect(screen.getByText('lan@example.com')).toBeTruthy()
    const name = screen.getByLabelText('Họ và tên')
    await user.clear(name)
    await user.type(name, 'Lan Chi')
    await user.clear(screen.getByLabelText('Số điện thoại (không bắt buộc)'))
    await user.click(screen.getByRole('button', { name: 'LƯU THAY ĐỔI' }))
    expect(send).toHaveBeenCalledWith('PATCH', '/api/account/profile', { name: 'Lan Chi', phone: '' })
    expect((await screen.findByRole('status')).textContent).toBe('Đã lưu thông tin.')
  })

  it('shows field errors and form errors', async () => {
    send.mockResolvedValueOnce({ success: false, data: null, error: { code: 'VALIDATION', message: 'x', fields: { name: 'Vui lòng nhập họ tên (2–80 ký tự).' } } })
    send.mockResolvedValueOnce({ success: false, data: null, error: { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh.' } })
    const user = userEvent.setup()
    render(<ProfileForm user={{ ...lan, phone: undefined }} />)
    expect(screen.getByLabelText('Số điện thoại (không bắt buộc)')).toHaveProperty('value', '')
    await user.click(screen.getByRole('button', { name: 'LƯU THAY ĐỔI' }))
    expect(await screen.findByText('Vui lòng nhập họ tên (2–80 ký tự).')).toBeTruthy()
    expect(screen.getByLabelText('Họ và tên').getAttribute('aria-invalid')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'LƯU THAY ĐỔI' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Bạn thao tác quá nhanh.')
  })
})

describe('PasswordForm', () => {
  it('marks a wrong current password on its field', async () => {
    send.mockResolvedValue({ success: false, data: null, error: { code: 'VALIDATION', message: 'x', fields: { currentPassword: 'Mật khẩu hiện tại không đúng.' } } })
    const user = userEvent.setup()
    render(<PasswordForm />)
    await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'sai')
    await user.type(screen.getByLabelText('Mật khẩu mới (8–72 ký tự)'), 'mat-khau-moi')
    await user.click(screen.getByRole('button', { name: 'ĐỔI MẬT KHẨU' }))
    expect(send).toHaveBeenCalledWith('POST', '/api/account/password', { currentPassword: 'sai', newPassword: 'mat-khau-moi' })
    expect(await screen.findByText('Mật khẩu hiện tại không đúng.')).toBeTruthy()
    expect(screen.getByLabelText('Mật khẩu hiện tại').getAttribute('aria-invalid')).toBe('true')
  })

  it('clears the fields and confirms on success', async () => {
    send.mockResolvedValue(success)
    const user = userEvent.setup()
    render(<PasswordForm />)
    await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'mat-khau-123')
    await user.type(screen.getByLabelText('Mật khẩu mới (8–72 ký tự)'), 'mat-khau-moi')
    await user.click(screen.getByRole('button', { name: 'ĐỔI MẬT KHẨU' }))
    expect((await screen.findByRole('status')).textContent).toContain('Đã đổi mật khẩu.')
    expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveProperty('value', '')
  })

  it('sends one request at a time', async () => {
    let resolve: (value: typeof success) => void = () => undefined
    send.mockReturnValue(new Promise((r) => { resolve = r }))
    const user = userEvent.setup()
    render(<PasswordForm />)
    await user.click(screen.getByRole('button', { name: 'ĐỔI MẬT KHẨU' }))
    screen.getByRole('button', { name: 'Đang xử lý…' }).closest('form')!.requestSubmit()
    expect(send).toHaveBeenCalledTimes(1)
    resolve(success)
    expect(await screen.findByRole('status')).toBeTruthy()
  })
})
