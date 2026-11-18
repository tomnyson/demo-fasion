import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createFileOrderRepository } from './repository'
import type { Order } from './schema'

const order = (code: string): Order => ({
  code,
  createdAt: '2026-11-18T03:00:00.000Z',
  customer: { name: 'A B', phone: '0901234567', province: 'Hà Nội', address: '12 Đường Mẫu' },
  payment: 'cod',
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
})

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'orders-'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

describe('createFileOrderRepository', () => {
  it('stores and finds orders by code', async () => {
    const repo = createFileOrderRepository(join(dir, 'orders.jsonl'))
    expect(await repo.findByCode('LS-261118-AAAAAAAA')).toBeNull()
    await repo.create(order('LS-261118-AAAAAAAA'))
    await repo.create(order('LS-261118-BBBBBBBB'))
    expect((await repo.findByCode('LS-261118-BBBBBBBB'))?.code).toBe('LS-261118-BBBBBBBB')
    expect(await repo.findByCode('LS-261118-CCCCCCCC')).toBeNull()
  })
})
