import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storedOrder } from './fixtures'
import { findOwnOrder } from './owned'
import { createFileOrderRepository, type OrderRepository } from './repository'

let dir: string
let repo: OrderRepository
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'owned-'))
  repo = createFileOrderRepository(join(dir, 'orders.jsonl'))
  await repo.create(storedOrder('LS-261118-AAAAAAAA', { userId: 'u1' }))
  await repo.create(storedOrder('LS-261118-BBBBBBBB'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

describe('findOwnOrder', () => {
  it('returns only the user’s own order', async () => {
    expect((await findOwnOrder(repo, 'u1', 'LS-261118-AAAAAAAA'))?.code).toBe('LS-261118-AAAAAAAA')
    for (const [user, code] of [
      ['u2', 'LS-261118-AAAAAAAA'],
      ['u1', 'LS-261118-BBBBBBBB'],
      ['u1', 'LS-261118-ZZZZZZZZ'],
      ['u1', '../etc'],
    ])
      expect(await findOwnOrder(repo, user, code)).toBeNull()
  })
})
