import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storedOrder as order } from './fixtures'
import { createFileOrderRepository, couponUsageIn } from './repository'

const NOW = new Date('2026-11-19T05:00:00.000Z')

let dir: string
let file: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'orders-'))
  file = join(dir, 'orders.jsonl')
})
afterEach(() => rm(dir, { recursive: true, force: true }))

const LEGACY = {
  code: 'LS-261101-LEGACY22',
  createdAt: '2026-11-01T03:00:00.000Z',
  customer: { name: 'A B', phone: '0901234567', province: 'Hà Nội', address: '12 Đường Mẫu' },
  payment: 'cod',
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
}

describe('createFileOrderRepository', () => {
  it('stores and finds orders by code', async () => {
    const repo = createFileOrderRepository(file)
    expect(await repo.findByCode('LS-261118-AAAAAAAA')).toBeNull()
    await repo.create(order('LS-261118-AAAAAAAA'))
    await repo.create(order('LS-261118-BBBBBBBB'))
    expect((await repo.findByCode('LS-261118-BBBBBBBB'))?.code).toBe('LS-261118-BBBBBBBB')
    expect(await repo.findByCode('LS-261118-CCCCCCCC')).toBeNull()
  })

  it('reads legacy lines without id or status as pending orders and can update them', async () => {
    await writeFile(file, `${JSON.stringify(LEGACY)}\n`)
    const repo = createFileOrderRepository(file)
    expect(await repo.findByCode(LEGACY.code)).toMatchObject({
      id: LEGACY.code,
      status: 'pending',
      statusHistory: [{ status: 'pending', at: LEGACY.createdAt }],
    })
    const r = await repo.updateStatus(LEGACY.code, 'confirmed', NOW)
    expect(r.ok).toBe(true)
    expect((await repo.findByCode(LEGACY.code))?.status).toBe('confirmed')
    expect((await readFile(file, 'utf8')).split('\n')[0]).toBe(JSON.stringify(LEGACY))
  })

  it('lists a user’s orders newest first and nobody else’s', async () => {
    const repo = createFileOrderRepository(file)
    await repo.create(order('LS-261101-AAAAAAAA', { userId: 'u1', createdAt: '2026-11-01T00:00:00.000Z' }))
    await repo.create(order('LS-261103-BBBBBBBB', { userId: 'u1', createdAt: '2026-11-03T00:00:00.000Z' }))
    await repo.create(order('LS-261102-CCCCCCCC', { userId: 'u2', createdAt: '2026-11-02T00:00:00.000Z' }))
    await repo.create(order('LS-261104-DDDDDDDD'))
    expect((await repo.listForUser('u1')).map((o) => o.code)).toEqual(['LS-261103-BBBBBBBB', 'LS-261101-AAAAAAAA'])
    expect(await repo.listForUser('nobody')).toEqual([])
  })

  it('counts coupon use per code and per user, ignoring cancelled orders', async () => {
    const repo = createFileOrderRepository(file)
    expect(await repo.couponUsage('GIAM50K')).toEqual({ total: 0, byUser: 0 })
    await repo.create(order('LS-261118-AAAAAAAA', { couponCode: 'GIAM50K', userId: 'u1' }))
    await repo.create(order('LS-261118-BBBBBBBB', { couponCode: 'GIAM50K' }))
    await repo.create(order('LS-261118-CCCCCCCC', { couponCode: 'FREESHIP', userId: 'u1' }))
    await repo.create(order('LS-261118-DDDDDDDD', { couponCode: 'GIAM50K', userId: 'u1' }))
    expect(await repo.couponUsage('GIAM50K', 'u1')).toEqual({ total: 3, byUser: 2 })
    await repo.updateStatus('LS-261118-DDDDDDDD', 'cancelled', NOW)
    expect(await repo.couponUsage('GIAM50K', 'u1')).toEqual({ total: 2, byUser: 1 })
    expect(await repo.couponUsage('GIAM50K')).toEqual({ total: 2, byUser: 0 })
  })

  it('records each status change in the history', async () => {
    const repo = createFileOrderRepository(file)
    await repo.create(order('LS-261118-AAAAAAAA'))
    const r = await repo.updateStatus('LS-261118-AAAAAAAA', 'confirmed', NOW)
    expect(r.ok && r.order.statusHistory).toEqual([
      { status: 'pending', at: '2026-11-18T03:00:00.000Z' },
      { status: 'confirmed', at: NOW.toISOString() },
    ])
  })

  it('refuses unknown orders, invalid transitions and guarded changes without writing', async () => {
    const repo = createFileOrderRepository(file)
    await repo.create(order('LS-261118-AAAAAAAA', { userId: 'u1' }))
    expect(await repo.updateStatus('LS-261118-ZZZZZZZZ', 'confirmed', NOW)).toEqual({ ok: false, reason: 'not_found' })
    expect(await repo.updateStatus('LS-261118-AAAAAAAA', 'delivered', NOW)).toMatchObject({ ok: false, reason: 'invalid_transition' })
    expect(await repo.updateStatus('LS-261118-AAAAAAAA', 'cancelled', NOW, () => 'not_found')).toEqual({ ok: false, reason: 'not_found' })
    expect(await repo.updateStatus('LS-261118-AAAAAAAA', 'cancelled', NOW, () => 'not_allowed')).toMatchObject({ ok: false, reason: 'not_allowed' })
    expect((await readFile(file, 'utf8')).trim().split('\n')).toHaveLength(1)
  })

  it('applies parallel updates of the same order once', async () => {
    const repo = createFileOrderRepository(file)
    await repo.create(order('LS-261118-AAAAAAAA'))
    const results = await Promise.all(Array.from({ length: 10 }, () => repo.updateStatus('LS-261118-AAAAAAAA', 'cancelled', NOW)))
    expect(results.filter((r) => r.ok)).toHaveLength(1)
    expect((await repo.findByCode('LS-261118-AAAAAAAA'))?.statusHistory).toHaveLength(2)
  })
})

describe('couponUsageIn', () => {
  it('reports zero per-user use for guests', () => {
    expect(couponUsageIn([order('LS-261118-AAAAAAAA', { couponCode: 'X', userId: 'u1' })], 'X')).toEqual({ total: 1, byUser: 0 })
  })
})
