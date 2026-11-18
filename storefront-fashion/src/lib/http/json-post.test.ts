import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleJsonPost, MAX_BODY_CHARS } from './json-post'
import { createRateLimiter } from './rate-limit'
import { ok } from './api-response'

const request = (text: string, headers: Record<string, string> = {}) =>
  new Request('http://shop.test/api/x', {
    method: 'POST',
    headers: { origin: 'http://shop.test', host: 'shop.test', 'x-forwarded-for': '1.1.1.1', ...headers },
    body: text,
  })

const setup = (limit = 5) => {
  const handle = vi.fn(async (body: unknown) => ok({ body }, 201))
  const limiter = createRateLimiter({ limit, windowMs: 60_000 })
  const run = (req: Request) => handleJsonPost(req, { limiter, route: '/api/x', handle })
  return { handle, run }
}

afterEach(() => vi.restoreAllMocks())

describe('handleJsonPost', () => {
  it('passes the parsed body to the handler and returns its response', async () => {
    const { handle, run } = setup()
    const res = await run(request('{"a":1}'))
    expect(res.status).toBe(201)
    expect(handle).toHaveBeenCalledWith({ a: 1 })
  })

  it('rejects cross-origin requests with 403 before touching the body', async () => {
    const { handle, run } = setup()
    const res = await run(request('{}', { origin: 'http://evil.test' }))
    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ error: { code: 'FORBIDDEN', message: 'Yêu cầu không hợp lệ.' } })
    expect(handle).not.toHaveBeenCalled()
  })

  it('rate limits with 429 and Retry-After', async () => {
    const { run } = setup(1)
    await run(request('{}'))
    const res = await run(request('{}'))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('60')
    expect(await res.json()).toMatchObject({
      error: { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' },
    })
  })

  it.each([
    ['malformed JSON', '{oops'],
    ['oversized body', JSON.stringify({ pad: 'x'.repeat(MAX_BODY_CHARS) })],
  ])('rejects %s with 400', async (_name, text) => {
    const { handle, run } = setup()
    const res = await run(request(text))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.' } })
    expect(handle).not.toHaveBeenCalled()
  })

  it('logs context and returns a generic 500 when the handler throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const boom = new Error('disk full')
    const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })
    const res = await handleJsonPost(request('{}'), { limiter, route: '/api/x', handle: async () => { throw boom } })
    expect(res.status).toBe(500)
    expect(await res.json()).toMatchObject({ error: { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' } })
    expect(spy).toHaveBeenCalledWith('[POST /api/x] unexpected error', { client: '1.1.1.1', error: boom })
  })
})
