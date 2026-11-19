import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AccountLink, MobileAccountLink } from './AccountLink'
import { resetSessionCache } from './useSessionUser'

const respond = (body: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body)))

beforeEach(() => resetSessionCache())
afterEach(() => vi.unstubAllGlobals())

describe('AccountLink', () => {
  it('links to sign-in while signed out', async () => {
    const fetchMock = respond({ success: true, data: { user: null }, error: null })
    vi.stubGlobal('fetch', fetchMock)
    render(<AccountLink />)
    expect(screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href')).toBe('/dang-nhap')
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' }))
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeTruthy()
  })

  it('switches to the account page once the session is known, sharing one request', async () => {
    const fetchMock = respond({ success: true, data: { user: { name: 'Lan' } }, error: null })
    vi.stubGlobal('fetch', fetchMock)
    render(
      <>
        <AccountLink />
        <MobileAccountLink onNavigate={() => undefined} />
      </>,
    )
    const links = await screen.findAllByRole('link', { name: 'Tài khoản' })
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/tai-khoan', '/tai-khoan'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to sign-in when the request fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline'))
    vi.stubGlobal('fetch', fetchMock)
    render(<MobileAccountLink onNavigate={() => undefined} />)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(screen.getByRole('link', { name: 'Đăng nhập' }).getAttribute('href')).toBe('/dang-nhap')
  })
})
