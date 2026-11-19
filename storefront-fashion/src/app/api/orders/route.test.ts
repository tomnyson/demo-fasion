import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { signedInUser } from '@/app/api/account/test-helpers'
import { createAddressRepository } from '@/lib/addresses/repository'
import { valid } from '@/lib/orders/fixtures'
import { createFileOrderRepository } from '@/lib/orders/repository'
import { ORDER_CODE_PATTERN } from '@/lib/orders/code'

let dir: string
let POST: (request: Request) => Promise<Response>
let counter = 0

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'orders-route-'))
  process.env.DATA_DIR = dir
  ;({ POST } = await import('./route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

const send = (text: string, headers: Record<string, string> = {}) => {
  counter += 1
  return new Request('http://shop.test/api/orders', {
    method: 'POST',
    headers: { origin: 'http://shop.test', host: 'shop.test', 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${counter}`, ...headers },
    body: text,
  })
}
const post = (body: unknown, headers?: Record<string, string>) => send(JSON.stringify(body), headers)
const rawPost = (text: string) => send(text)

const HOME = { recipient: 'Trần Thị B', phone: '0912345678', province: 'Đà Nẵng', address: '45 Bạch Đằng' } as const

describe('POST /api/orders', () => {
  it('stores the signed-in user on the order and resolves their saved address', async () => {
    const { userId, cookie } = await signedInUser()
    const added = await createAddressRepository().add(userId, HOME)
    if (!added.ok) throw new Error('setup')
    const { customer: _c, ...rest } = valid
    void _c
    const res = await POST(post({ ...rest, addressId: added.address.id, customer: { email: '', note: '' } }, { cookie }))
    expect(res.status).toBe(201)
    const order = await createFileOrderRepository().findByCode((await res.json()).data.code)
    expect(order).toMatchObject({ userId, status: 'pending', customer: { name: HOME.recipient, province: HOME.province } })
  })

  it('refuses a foreign or unknown address id, and guests sending one, without storing', async () => {
    const owner = await signedInUser()
    const other = await signedInUser()
    const added = await createAddressRepository().add(owner.userId, HOME)
    if (!added.ok) throw new Error('setup')
    const before = (await createFileOrderRepository().mutate((all) => ({ writes: [], result: all }))).length
    for (const [addressId, headers] of [
      [added.address.id, { cookie: other.cookie }],
      ['missing', { cookie: owner.cookie }],
      [added.address.id, {}],
    ] as const) {
      const res = await POST(post({ ...valid, addressId }, headers))
      expect(res.status).toBe(400)
      expect((await res.json()).error.fields).toEqual({ addressId: 'Địa chỉ giao hàng không hợp lệ.' })
    }
    const after = (await createFileOrderRepository().mutate((all) => ({ writes: [], result: all }))).length
    expect(after).toBe(before)
  })

  it('keeps guest orders unowned', async () => {
    const res = await POST(post(valid))
    const order = await createFileOrderRepository().findByCode((await res.json()).data.code)
    expect(order).not.toHaveProperty('userId')
  })

  it('applies a coupon on the server and reports an unusable one under couponCode', async () => {
    const res = await POST(post({ ...valid, couponCode: 'FREESHIP' }))
    expect(res.status).toBe(201)
    const bad = await POST(post({ ...valid, couponCode: 'KHONGCO' }))
    expect(bad.status).toBe(400)
    expect((await bad.json()).error.fields).toEqual({ couponCode: 'Mã giảm giá không tồn tại.' })
  })

  it('creates an order and returns its code', async () => {
    const res = await POST(post(valid))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toMatchObject({ success: true, error: null })
    expect(json.data.code).toMatch(ORDER_CODE_PATTERN)
    expect(Object.keys(json.data)).toEqual(['code'])
  })

  it('rejects a cross-origin request', async () => {
    expect((await POST(post(valid, { origin: 'https://evil.test' }))).status).toBe(403)
  })

  it('rejects malformed or oversized bodies', async () => {
    expect((await POST(rawPost('{oops'))).status).toBe(400)
    const huge = await POST(rawPost(JSON.stringify({ pad: 'x'.repeat(20_001) })))
    expect(huge.status).toBe(400)
    expect(await huge.json()).toMatchObject({ error: { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.' } })
  })

  it('returns field errors for invalid input', async () => {
    const res = await POST(post({ ...valid, lines: [] }))
    expect(res.status).toBe(400)
    const bad = await res.json()
    expect(bad).toMatchObject({ success: false, data: null, error: { code: 'VALIDATION', fields: { lines: 'Giỏ hàng không hợp lệ.' } } })
  })

  it('rate limits to 5 requests per client', async () => {
    const ip = { 'x-forwarded-for': '9.9.9.9' }
    for (let i = 0; i < 5; i++) await POST(post(valid, ip))
    const limited = await POST(post(valid, ip))
    expect(limited.status).toBe(429)
    expect(limited.headers.get('retry-after')).toBeTruthy()
    expect(await limited.json()).toMatchObject({
      error: { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' },
    })
  })

  it('hides internals when storage fails', async () => {
    const blocker = join(dir, 'blocker')
    await writeFile(blocker, 'file, not a directory')
    process.env.DATA_DIR = blocker
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const res = await POST(post(valid))
      expect(res.status).toBe(500)
      const json = await res.json()
      expect(json).toEqual({ success: false, data: null, error: { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' } })
      expect(spy).toHaveBeenCalledTimes(1)
    } finally {
      process.env.DATA_DIR = dir
      spy.mockRestore()
    }
  })
})
