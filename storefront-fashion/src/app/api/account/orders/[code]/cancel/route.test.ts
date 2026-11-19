import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { jsonRequest, signedInUser } from '@/app/api/account/test-helpers'
import { generateOrderCode } from '@/lib/orders/code'
import { storedOrder } from '@/lib/orders/fixtures'
import { createFileOrderRepository } from '@/lib/orders/repository'

let dir: string
let POST: typeof import('./route').POST

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'cancel-route-'))
  process.env.DATA_DIR = dir
  ;({ POST } = await import('./route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

async function orderFor(userId?: string): Promise<string> {
  const code = generateOrderCode(new Date())
  await createFileOrderRepository().create(storedOrder(code, userId === undefined ? {} : { userId }))
  return code
}

const cancel = (code: string, cookie?: string) =>
  POST(jsonRequest('POST', `/api/account/orders/${code}/cancel`, undefined, cookie === undefined ? {} : { cookie }), {
    params: Promise.resolve({ code }),
  })

describe('POST /api/account/orders/[code]/cancel', () => {
  it('cancels the customer’s own pending order', async () => {
    const { userId, cookie } = await signedInUser()
    const code = await orderFor(userId)
    const res = await cancel(code, cookie)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect((await res.json()).data).toEqual({ code, status: 'cancelled' })
    expect((await createFileOrderRepository().findByCode(code))?.status).toBe('cancelled')
  })

  it('answers 404 for someone else’s order, a guest order, an unknown or malformed code', async () => {
    const owner = await signedInUser()
    const other = await signedInUser()
    const foreign = await orderFor(owner.userId)
    const guest = await orderFor()
    for (const code of [foreign, guest, 'LS-261119-ZZZZZZZZ', 'nope']) {
      const res = await cancel(code, other.cookie)
      expect(res.status).toBe(404)
      expect((await res.json()).error).toEqual({ code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng.' })
    }
    expect((await createFileOrderRepository().findByCode(foreign))?.status).toBe('pending')
  })

  it('answers 409 once the shop has confirmed the order', async () => {
    const { userId, cookie } = await signedInUser()
    const code = await orderFor(userId)
    await createFileOrderRepository().updateStatus(code, 'confirmed', new Date())
    const res = await cancel(code, cookie)
    expect(res.status).toBe(409)
    expect((await res.json()).error).toEqual({ code: 'CONFLICT', message: 'Đơn đã được xác nhận, vui lòng liên hệ shop để huỷ.' })
  })

  it('lets exactly one of two parallel cancels succeed', async () => {
    const { userId, cookie } = await signedInUser()
    const code = await orderFor(userId)
    const statuses = (await Promise.all([cancel(code, cookie), cancel(code, cookie)])).map((r) => r.status).sort()
    expect(statuses).toEqual([200, 409])
    expect((await createFileOrderRepository().findByCode(code))?.statusHistory).toHaveLength(2)
  })

  it('requires a session', async () => {
    expect((await cancel(await orderFor())).status).toBe(401)
  })
})
