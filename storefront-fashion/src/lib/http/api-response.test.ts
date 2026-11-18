import { describe, expect, it } from 'vitest'
import { fail, ok } from './api-response'

describe('api-response', () => {
  it('ok wraps data in the envelope', async () => {
    const res = ok({ a: 1 }, 201)
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ success: true, data: { a: 1 }, error: null })
    expect(ok(1).status).toBe(200)
  })

  it('fail wraps an error and forwards headers', async () => {
    const res = fail(429, { code: 'RATE_LIMITED', message: 'm' }, { 'Retry-After': '3' })
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('3')
    expect(await res.json()).toEqual({ success: false, data: null, error: { code: 'RATE_LIMITED', message: 'm' } })
  })
})
