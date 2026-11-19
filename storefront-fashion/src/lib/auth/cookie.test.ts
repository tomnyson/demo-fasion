import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearedSessionCookie, readSessionToken, SESSION_COOKIE, sessionCookie } from './cookie'

afterEach(() => vi.unstubAllEnvs())

const withCookie = (cookie?: string) => new Request('http://shop.test', cookie === undefined ? {} : { headers: { cookie } })

describe('session cookie', () => {
  it('is httpOnly, SameSite=Lax, Path=/ and expires with the session', () => {
    const expires = new Date('2026-12-19T08:00:00.000Z')
    const header = sessionCookie('tok', expires)
    expect(SESSION_COOKIE).toBe('ls_session')
    expect(header).toBe('ls_session=tok; Path=/; Expires=Sat, 19 Dec 2026 08:00:00 GMT; HttpOnly; SameSite=Lax')
  })

  it('adds Secure in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(sessionCookie('tok', new Date(0))).toMatch(/; Secure$/)
    expect(clearedSessionCookie()).toMatch(/; Secure$/)
  })

  it('clears with an expired empty cookie', () => {
    expect(clearedSessionCookie()).toBe('ls_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax')
  })

  it('reads the token from the Cookie header', () => {
    expect(readSessionToken(withCookie('a=1; ls_session=abc_-9; b=2'))).toBe('abc_-9')
    expect(readSessionToken(withCookie('ls_session_x=1'))).toBeNull()
    expect(readSessionToken(withCookie('ls_session='))).toBeNull()
    expect(readSessionToken(withCookie())).toBeNull()
  })
})
