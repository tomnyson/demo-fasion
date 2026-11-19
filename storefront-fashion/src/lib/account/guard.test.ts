import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublicUser } from '@/lib/auth/users'
import { proxy, config } from '@/proxy'

const state = vi.hoisted(() => ({ user: null as PublicUser | null, header: null as string | null }))
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: async () => state.user }))
vi.mock('next/headers', () => ({ headers: async () => new Headers(state.header === null ? {} : { 'x-account-path': state.header }) }))
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`)
  },
}))

const { accountPath, loginUrlFor, requestedAccountPath, requireAccountUser } = await import('./guard')

const lan: PublicUser = { id: 'u1', email: 'lan@example.com', name: 'Lan', createdAt: '2026-11-19T00:00:00.000Z' }

beforeEach(() => {
  state.user = null
  state.header = null
})

describe('accountPath', () => {
  it('keeps paths inside the account area and falls back otherwise', () => {
    expect(accountPath('/tai-khoan/dia-chi')).toBe('/tai-khoan/dia-chi')
    expect(accountPath('/tai-khoan')).toBe('/tai-khoan')
    for (const bad of [null, undefined, '', '/gio-hang', '//evil.com', 'https://evil.com', '/tai-khoanx']) expect(accountPath(bad)).toBe('/tai-khoan')
  })

  it('builds an encoded login URL', () => {
    expect(loginUrlFor('/tai-khoan/dia-chi')).toBe('/dang-nhap?next=%2Ftai-khoan%2Fdia-chi')
  })
})

describe('requireAccountUser', () => {
  it('redirects signed-out visitors to the login page with next', async () => {
    await expect(requireAccountUser('/tai-khoan/dia-chi')).rejects.toThrow('REDIRECT /dang-nhap?next=%2Ftai-khoan%2Fdia-chi')
  })

  it('returns the signed-in user', async () => {
    state.user = lan
    expect(await requireAccountUser('/tai-khoan')).toBe(lan)
  })
})

describe('requestedAccountPath', () => {
  it('reads the proxy header and validates it', async () => {
    expect(await requestedAccountPath()).toBe('/tai-khoan')
    state.header = '/tai-khoan/dia-chi'
    expect(await requestedAccountPath()).toBe('/tai-khoan/dia-chi')
    state.header = '//evil.com'
    expect(await requestedAccountPath()).toBe('/tai-khoan')
  })
})

describe('proxy', () => {
  it('overwrites any client-sent account path header with the real pathname', () => {
    const request = new NextRequest('http://shop.test/tai-khoan/dia-chi?x=1', { headers: { 'x-account-path': '/evil' } })
    const response = proxy(request)
    expect(response.headers.get('x-middleware-request-x-account-path')).toBe('/tai-khoan/dia-chi')
    expect(config.matcher).toContain('/tai-khoan/:path*')
  })
})
