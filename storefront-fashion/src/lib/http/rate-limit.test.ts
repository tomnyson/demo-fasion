import { describe, expect, it } from 'vitest'
import { clientKey, createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows up to the limit per key, then blocks until the window passes', () => {
    let t = 0
    const hit = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t })
    expect(hit('a').allowed).toBe(true)
    expect(hit('a').allowed).toBe(true)
    expect(hit('a')).toEqual({ allowed: false, retryAfterSec: 1 })
    expect(hit('b').allowed).toBe(true)
    t = 1001
    expect(hit('a').allowed).toBe(true)
  })

  it('rounds retryAfterSec up and forgets expired keys', () => {
    let t = 0
    const hit = createRateLimiter({ limit: 1, windowMs: 1500, now: () => t })
    hit('a')
    t = 100
    expect(hit('a')).toEqual({ allowed: false, retryAfterSec: 2 })
    t = 5000
    for (let i = 0; i < 1100; i++) hit(`k${i}`)
    expect(hit('a').allowed).toBe(true)
  })
})

describe('clientKey', () => {
  const key = (headers: Record<string, string>) => clientKey(new Request('http://x', { headers }))

  it('uses the rightmost x-forwarded-for entry, which the nearest proxy appended', () => {
    expect(key({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })).toBe('5.6.7.8')
    expect(key({ 'x-forwarded-for': 'spoofed, 9.9.9.9 ' })).toBe('9.9.9.9')
    expect(key({ 'x-forwarded-for': '10.0.0.1' })).toBe('10.0.0.1')
  })

  it('falls back to x-real-ip, then unknown', () => {
    expect(key({ 'x-real-ip': ' 4.4.4.4 ' })).toBe('4.4.4.4')
    expect(key({ 'x-forwarded-for': ' ', 'x-real-ip': '4.4.4.4' })).toBe('4.4.4.4')
    expect(key({ 'x-forwarded-for': '1.1.1.1, ' })).toBe('unknown')
    expect(key({})).toBe('unknown')
    expect(key({ 'x-forwarded-for': ' ', 'x-real-ip': ' ' })).toBe('unknown')
  })
})
