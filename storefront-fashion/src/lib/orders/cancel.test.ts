import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cancelOrderForUser } from './cancel'
import { storedOrder } from './fixtures'
import { createFileOrderRepository, type OrderRepository } from './repository'
import type { OrderStatus } from './status'

let dir: string
let repo: OrderRepository
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'cancel-'))
  repo = createFileOrderRepository(join(dir, 'orders.jsonl'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

describe('cancelOrderForUser', () => {
  it('explains why each later status cannot be cancelled by the customer', async () => {
    const cases: [OrderStatus, string][] = [
      ['confirmed', 'Đơn đã được xác nhận, vui lòng liên hệ shop để huỷ.'],
      ['shipping', 'Đơn đang được giao, vui lòng liên hệ shop để được hỗ trợ.'],
      ['delivered', 'Đơn đã giao thành công nên không thể huỷ.'],
      ['cancelled', 'Đơn hàng đã được huỷ trước đó.'],
    ]
    for (const [status, message] of cases) {
      const code = `LS-261119-${status.toUpperCase().padEnd(8, 'X').slice(0, 8)}`
      await repo.create(storedOrder(code, { userId: 'u1', status }))
      expect(await cancelOrderForUser(repo, 'u1', code, new Date())).toEqual({ ok: false, reason: 'conflict', message })
    }
  })
})
