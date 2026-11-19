import { afterEach, describe, expect, it, vi } from 'vitest'
import { ok } from './api-response'
import { handleJsonRoute, MAX_BODY_CHARS } from './json-route'
import { createRateLimiter } from './rate-limit'

const request = (method: string, body?: string, headers: Record<string, string> = {}) =>
  new Request('http://shop.test/api/x', {
    method,
    headers: { origin: 'http://shop.test', host: 'shop.test', 'x-forwarded-for': '2.2.2.2', ...headers },
    body,
  })

const setup = (options: { allowEmptyBody?: boolean } = {}) => {
  const handle = vi.fn(async (body: unknown, req: Request) => ok({ body, method: req.method }))
  const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })
  const run = (req: Request) => handleJsonRoute(req, { route: '/api/x', limiter, handle, ...options })
  return { handle, run }
}

afterEach(() => vi.restoreAllMocks())

describe('handleJsonRoute', () => {
  it.each(['POST', 'PATCH', 'DELETE'])('parses a JSON body for %s and hands over the request', async (method) => {
    const { run } = setup()
    const res = await run(request(method, '{"a":1}'))
    expect(await res.json()).toMatchObject({ data: { body: { a: 1 }, method } })
  })

  it('rejects an empty body unless allowEmptyBody is set, then passes undefined', async () => {
    expect((await setup().run(request('DELETE'))).status).toBe(400)
    const { run, handle } = setup({ allowEmptyBody: true })
    expect((await run(request('DELETE'))).status).toBe(200)
    expect(handle).toHaveBeenCalledWith(undefined, expect.any(Request))
  })

  it('checks origin before anything else', async () => {
    const { run, handle } = setup()
    expect((await run(request('PATCH', '{}', { origin: 'http://evil.test' }))).status).toBe(403)
    expect(handle).not.toHaveBeenCalled()
  })

  it('rejects oversized bodies', async () => {
    const res = await setup().run(request('PATCH', JSON.stringify({ pad: 'x'.repeat(MAX_BODY_CHARS) })))
    expect(res.status).toBe(400)
  })

  it('labels unexpected errors with the request method', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const boom = new Error('x')
    const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })
    const res = await handleJsonRoute(request('DELETE', '{}'), { route: '/api/x', limiter, handle: async () => { throw boom } })
    expect(res.status).toBe(500)
    expect(spy).toHaveBeenCalledWith('[DELETE /api/x] unexpected error', { client: '2.2.2.2', error: boom })
  })
})
