import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AuthPage } from './AuthPage'

const redirect = vi.hoisted(() => vi.fn(() => { throw new Error('NEXT_REDIRECT') }))
vi.mock('next/navigation', () => ({ redirect }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: vi.fn() }))

const currentUser = vi.mocked(getCurrentUser)
const params = (value: Record<string, string | string[] | undefined>) => Promise.resolve(value)

beforeEach(() => {
  redirect.mockClear()
  currentUser.mockResolvedValue(null)
})

describe('AuthPage', () => {
  it('renders the login form with a sanitised next', async () => {
    render(await AuthPage({ mode: 'login', searchParams: params({ next: '//evil.com' }) }))
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Đăng ký' }).getAttribute('href')).toBe('/dang-ky?next=%2Ftai-khoan')
  })

  it('renders the register form', async () => {
    render(await AuthPage({ mode: 'register', searchParams: params({ next: '/thanh-toan' }) }))
    expect(screen.getByRole('button', { name: 'TẠO TÀI KHOẢN' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href')).toBe('/dang-nhap?next=%2Fthanh-toan')
  })

  it('sends a signed-in visitor straight to the safe next page', async () => {
    currentUser.mockResolvedValue({ id: 'u', email: 'a@b.vn', name: 'A', createdAt: 't' })
    await expect(AuthPage({ mode: 'login', searchParams: params({ next: 'https://evil.com' }) })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/tai-khoan')
  })
})
