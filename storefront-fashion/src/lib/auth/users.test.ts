import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { verifyPassword } from './password'
import { createUserRepository, EMAIL_TAKEN, toPublicUser, type UserRepository } from './users'

let dir: string
let users: UserRepository
const now = new Date('2026-11-19T08:00:00.000Z')
const input = { name: 'Lan Anh', email: 'lan@example.com', phone: '0901234567', password: '12345678' }

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'users-'))
  users = createUserRepository(join(dir, 'users.jsonl'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('createUserRepository', () => {
  it('registers a user with a hashed password and returns only public fields', async () => {
    const result = await users.register(input, now)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.user).toEqual({ id: expect.any(String), email: 'lan@example.com', name: 'Lan Anh', phone: '0901234567', createdAt: now.toISOString() })
    expect(result.user).not.toHaveProperty('passwordHash')
    const stored = await users.findById(result.user.id)
    expect(await verifyPassword('12345678', stored!.passwordHash)).toBe(true)
    expect(await readFile(join(dir, 'users.jsonl'), 'utf8')).not.toContain('12345678')
  })

  it('finds users by email regardless of case and spacing', async () => {
    await users.register({ ...input, email: ' Lan@Example.com ' }, now)
    expect((await users.findByEmail('LAN@example.COM'))?.email).toBe('lan@example.com')
    expect(await users.findByEmail('other@example.com')).toBeNull()
    expect(await users.findById('missing')).toBeNull()
  })

  it('rejects a duplicate email with different case', async () => {
    await users.register(input, now)
    expect(await users.register({ ...input, email: 'LAN@EXAMPLE.COM' }, now)).toEqual({ ok: false, fields: { email: EMAIL_TAKEN } })
  })

  it('lets only one of two parallel registrations for the same email succeed', async () => {
    const results = await Promise.all([users.register(input, now), users.register({ ...input, email: 'Lan@example.com' }, now)])
    expect(results.filter((result) => result.ok)).toHaveLength(1)
    expect(results.filter((result) => !result.ok)).toEqual([{ ok: false, fields: { email: EMAIL_TAKEN } }])
  })

  it('omits phone when not given', async () => {
    const result = await users.register({ name: 'An', email: 'an@example.com', password: '12345678' }, now)
    expect(result.ok && result.user).not.toHaveProperty('phone')
  })

  it('updates name, phone and password hash without touching other fields', async () => {
    const created = await users.register(input, now)
    if (!created.ok) throw new Error('setup')
    const updated = await users.update(created.user.id, { name: 'Lan', phone: null, passwordHash: 'new-hash' })
    expect(updated).toMatchObject({ id: created.user.id, email: 'lan@example.com', name: 'Lan', passwordHash: 'new-hash' })
    expect(updated).not.toHaveProperty('phone')
    expect(await users.findById(created.user.id)).toEqual(updated)
    expect(await users.update(created.user.id, { phone: '0912345678' })).toMatchObject({ name: 'Lan', phone: '0912345678' })
    expect(await users.update('missing', { name: 'X' })).toBeNull()
  })

  it('toPublicUser drops the password hash', () => {
    const user = { id: 'u', email: 'a@b.vn', name: 'A', passwordHash: 'h', createdAt: 't' }
    expect(toPublicUser(user)).toEqual({ id: 'u', email: 'a@b.vn', name: 'A', createdAt: 't' })
  })
})
