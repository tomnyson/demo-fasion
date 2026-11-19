import { describe, expect, it } from 'vitest'
import { normalizeOrder } from './normalize'

describe('normalizeOrder', () => {
  it('rejects lines that are not orders', () => {
    for (const raw of [null, 'x', [], {}, { code: 'A' }, { code: 1, createdAt: 'x' }]) expect(normalizeOrder(raw)).toBeNull()
  })

  it('keeps a valid status and history, and drops malformed history entries', () => {
    const at = '2026-11-18T03:00:00.000Z'
    const raw = { id: 'X', code: 'C', createdAt: at, status: 'confirmed', statusHistory: [{ status: 'pending', at }, { status: 'lost', at }, 'junk'] }
    expect(normalizeOrder(raw)).toMatchObject({ id: 'X', status: 'confirmed', statusHistory: [{ status: 'pending', at }] })
  })

  it('defaults an unknown status to pending', () => {
    expect(normalizeOrder({ code: 'C', createdAt: 'T', status: 'weird' })).toMatchObject({ id: 'C', status: 'pending', statusHistory: [{ status: 'pending', at: 'T' }] })
  })
})
