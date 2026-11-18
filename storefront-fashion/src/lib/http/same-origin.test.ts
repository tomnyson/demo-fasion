import { describe, expect, it } from 'vitest'
import { isSameOrigin } from './same-origin'

const rq = (h: Record<string, string>) => new Request('http://shop.test/api', { method: 'POST', headers: h })

describe('isSameOrigin', () => {
  it('accepts only an Origin whose host equals the Host header', () => {
    expect(isSameOrigin(rq({ origin: 'http://shop.test', host: 'shop.test' }))).toBe(true)
    expect(isSameOrigin(rq({ origin: 'https://evil.test', host: 'shop.test' }))).toBe(false)
    expect(isSameOrigin(rq({ host: 'shop.test' }))).toBe(false)
    expect(isSameOrigin(rq({ origin: 'not a url', host: 'shop.test' }))).toBe(false)
    expect(isSameOrigin(rq({ origin: 'http://shop.test' }))).toBe(false)
  })
})
