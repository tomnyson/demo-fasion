import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { signedInUser } from '@/app/api/account/test-helpers'
import { line } from '@/lib/orders/fixtures'

let dir: string
let POST: (request: Request) => Promise<Response>

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'coupon-route-'))
  process.env.DATA_DIR = dir
  ;({ POST } = await import('./route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

const post = (body: unknown, ip: string, origin = 'http://shop.test', extra: Record<string, string> = {}) =>
  new Request('http://shop.test/api/coupons/preview', {
    method: 'POST',
    headers: { origin, host: 'shop.test', 'content-type': 'application/json', 'x-forwarded-for': ip, ...extra },
    body: JSON.stringify(body),
  })

describe('POST /api/coupons/preview', () => {
  it('returns the discounted totals for a valid code', async () => {
    const res = await POST(post({ code: 'freeship', lines: [line(1)] }, '10.1.0.1'))
    expect(res.status).toBe(200)
    expect((await res.json()).data).toMatchObject({ code: 'FREESHIP', discount: 0, shipping: 0, total: 229000 })
  })

  it('accepts member-only codes for a signed-in customer only', async () => {
    const guest = await POST(post({ code: 'THANHVIEN15', lines: [line(2)] }, '10.1.0.5'))
    expect((await guest.json()).error.fields).toEqual({ couponCode: 'Vui lòng đăng nhập để dùng mã này.' })
    const { cookie } = await signedInUser()
    const member = await POST(post({ code: 'THANHVIEN15', lines: [line(2)] }, '10.1.0.6', 'http://shop.test', { cookie }))
    expect(member.status).toBe(200)
    expect(member.headers.get('cache-control')).toBe('no-store')
    expect((await member.json()).data).toMatchObject({ code: 'THANHVIEN15', discount: 68700 })
  })

  it('returns the reason under couponCode for an unusable code', async () => {
    const res = await POST(post({ code: 'NOPE', lines: [line(1)] }, '10.1.0.2'))
    expect(res.status).toBe(400)
    expect((await res.json()).error.fields).toEqual({ couponCode: 'Mã giảm giá không tồn tại.' })
  })

  it('rejects cross-origin calls and rate-limits guessing', async () => {
    expect((await POST(post({ code: 'A', lines: [line(1)] }, '10.1.0.3', 'http://evil.test'))).status).toBe(403)
    const statuses: number[] = []
    for (let i = 0; i < 11; i += 1) statuses.push((await POST(post({ code: `G${i}`, lines: [line(1)] }, '10.1.0.4'))).status)
    expect(statuses.slice(0, 10).every((s) => s === 400)).toBe(true)
    expect(statuses[10]).toBe(429)
  })
})
