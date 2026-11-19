import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storedOrder } from './fixtures'
import { createFileOrderRepository, type OrderRepository } from './repository'
import { runOrderStatus, USAGE } from './status-cli'

const CODE = 'LS-261118-AAAAAAAA'
let dir: string
let repo: OrderRepository
let out: string[]
let err: string[]

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'status-cli-'))
  repo = createFileOrderRepository(join(dir, 'orders.jsonl'))
  await repo.create(storedOrder(CODE))
  out = []
  err = []
})
afterEach(() => rm(dir, { recursive: true, force: true }))

const run = (...args: string[]) =>
  runOrderStatus(args, { repo, now: () => new Date('2026-11-19T05:00:00Z'), out: (l) => out.push(l), err: (l) => err.push(l) })

describe('runOrderStatus', () => {
  it('moves an order along the flow, accepting any case', async () => {
    expect(await run(CODE.toLowerCase(), 'CONFIRMED')).toBe(0)
    expect(out).toEqual([`Đã chuyển đơn ${CODE} sang "Đã xác nhận" (confirmed).`])
    expect((await repo.findByCode(CODE))?.status).toBe('confirmed')
  })

  it('refuses a transition outside the table', async () => {
    expect(await run(CODE, 'delivered')).toBe(1)
    expect(err).toEqual([`Không thể chuyển đơn ${CODE} từ "Chờ xác nhận" sang "Đã giao".`])
    expect((await repo.findByCode(CODE))?.status).toBe('pending')
  })

  it('reports an unknown order', async () => {
    expect(await run('LS-261118-ZZZZZZZZ', 'confirmed')).toBe(1)
    expect(err).toEqual(['Không tìm thấy đơn LS-261118-ZZZZZZZZ.'])
  })

  it('validates its arguments', async () => {
    expect(await run()).toBe(2)
    expect(await run(CODE)).toBe(2)
    expect(await run('ABC', 'confirmed')).toBe(2)
    expect(await run(CODE, 'lost')).toBe(2)
    expect(err[0]).toBe(USAGE)
    expect(err.slice(2)).toEqual(['Mã đơn không hợp lệ: ABC', 'Trạng thái không hợp lệ: lost. Chọn một trong: pending, confirmed, shipping, delivered, cancelled.'])
  })
})
