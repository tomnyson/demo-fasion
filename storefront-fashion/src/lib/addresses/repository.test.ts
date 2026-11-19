import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ADDRESS_LIMIT_MESSAGE, createAddressRepository, MAX_ADDRESSES, type AddressRepository } from './repository'
import type { AddressInput } from './schema'

let dir: string
let repo: AddressRepository
let tick = 0
const clock = () => new Date(Date.UTC(2026, 10, 19, 8, 0, tick++))
const input = (n: number): AddressInput => ({ recipient: `Người nhận ${n}`, phone: '0901234567', province: 'Hà Nội', address: `${n} Phố Huế, Hai Bà Trưng` })

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'addresses-'))
  repo = createAddressRepository(join(dir, 'addresses.jsonl'), clock)
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

const defaults = async (userId: string) => (await repo.listFor(userId)).filter((a) => a.isDefault)

describe('createAddressRepository', () => {
  it('makes the first address the default and lists the default first, then newest', async () => {
    const first = await repo.add('u1', input(1))
    expect(first).toMatchObject({ ok: true, address: { userId: 'u1', isDefault: true, recipient: 'Người nhận 1' } })
    await repo.add('u1', input(2))
    await repo.add('u1', input(3))
    const list = await repo.listFor('u1')
    expect(list.map((a) => a.recipient)).toEqual(['Người nhận 1', 'Người nhận 3', 'Người nhận 2'])
    expect(await repo.listFor('u2')).toEqual([])
  })

  it('blocks the 11th address, even when adds race', async () => {
    const results = await Promise.all(Array.from({ length: MAX_ADDRESSES + 1 }, (_, i) => repo.add('u1', input(i))))
    expect(results.filter((r) => r.ok)).toHaveLength(MAX_ADDRESSES)
    expect(results.filter((r) => !r.ok)).toEqual([{ ok: false, message: ADDRESS_LIMIT_MESSAGE }])
    expect(ADDRESS_LIMIT_MESSAGE).toBe('Tối đa 10 địa chỉ.')
    expect(await repo.listFor('u1')).toHaveLength(MAX_ADDRESSES)
    expect(await defaults('u1')).toHaveLength(1)
  })

  it('updates only the owner’s address and keeps owner, default flag and creation time', async () => {
    const added = await repo.add('u1', input(1))
    if (!added.ok) throw new Error('setup')
    const updated = await repo.update('u1', added.address.id, input(9))
    expect(updated).toEqual({ ...added.address, ...input(9) })
    expect(await repo.update('u2', added.address.id, input(5))).toBeNull()
    expect(await repo.update('u1', 'missing', input(5))).toBeNull()
    expect((await repo.getOwned('u1', added.address.id))?.recipient).toBe('Người nhận 9')
  })

  it('getOwned hides other users’ addresses', async () => {
    const added = await repo.add('u1', input(1))
    if (!added.ok) throw new Error('setup')
    expect(await repo.getOwned('u2', added.address.id)).toBeNull()
    expect(await repo.getOwned('u1', 'nope')).toBeNull()
  })

  it('removing the default promotes the newest remaining address', async () => {
    const a = await repo.add('u1', input(1))
    const b = await repo.add('u1', input(2))
    const c = await repo.add('u1', input(3))
    if (!a.ok || !b.ok || !c.ok) throw new Error('setup')
    expect(await repo.remove('u2', a.address.id)).toBe(false)
    expect(await repo.remove('u1', a.address.id)).toBe(true)
    expect((await defaults('u1')).map((x) => x.id)).toEqual([c.address.id])
    expect(await repo.remove('u1', b.address.id)).toBe(true)
    expect((await repo.listFor('u1')).map((x) => x.id)).toEqual([c.address.id])
    expect(await repo.remove('u1', c.address.id)).toBe(true)
    expect(await repo.listFor('u1')).toEqual([])
    expect(await repo.remove('u1', c.address.id)).toBe(false)
  })

  it('setDefault moves the flag, refuses other users and keeps exactly one default under races', async () => {
    const ids: string[] = []
    for (let i = 0; i < 4; i++) {
      const r = await repo.add('u1', input(i))
      if (r.ok) ids.push(r.address.id)
    }
    expect(await repo.setDefault('u2', ids[2])).toBeNull()
    expect((await repo.setDefault('u1', ids[2]))?.isDefault).toBe(true)
    expect((await repo.listFor('u1'))[0].id).toBe(ids[2])
    await Promise.all(ids.map((id) => repo.setDefault('u1', id)))
    expect(await defaults('u1')).toHaveLength(1)
    expect((await repo.setDefault('u1', ids[0]))?.id).toBe(ids[0])
    expect((await repo.setDefault('u1', ids[0]))?.isDefault).toBe(true)
  })

  it('keeps users’ books separate when choosing defaults', async () => {
    await repo.add('u1', input(1))
    const other = await repo.add('u2', input(2))
    expect(other).toMatchObject({ ok: true, address: { isDefault: true } })
  })

  it('uses the data directory by default', () => {
    expect(createAddressRepository()).toHaveProperty('listFor')
  })
})
