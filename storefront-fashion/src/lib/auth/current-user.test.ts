import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSessionStore, type SessionStore } from './sessions'
import { createUserRepository, type UserRepository } from './users'

const cookieValue = vi.hoisted(() => ({ value: undefined as string | undefined }))
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (name === 'ls_session' && cookieValue.value !== undefined ? { name, value: cookieValue.value } : undefined) }),
}))

const { getCurrentUser, getRequestUser, userFromToken } = await import('./current-user')

let dir: string
let users: UserRepository
let sessions: SessionStore
let userId: string
let token: string
const now = new Date('2026-11-19T08:00:00.000Z')

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'current-user-'))
  process.env.DATA_DIR = dir
  users = createUserRepository(join(dir, 'users.jsonl'))
  sessions = createSessionStore(join(dir, 'sessions.jsonl'))
  const created = await users.register({ name: 'Lan', email: 'lan@example.com', password: '12345678' }, now)
  if (!created.ok) throw new Error('setup')
  userId = created.user.id
  token = (await sessions.create(userId, new Date())).token
})
afterEach(async () => {
  delete process.env.DATA_DIR
  cookieValue.value = undefined
  await rm(dir, { recursive: true, force: true })
})

describe('userFromToken', () => {
  it('returns the public user for a live session', async () => {
    const user = await userFromToken(token, { users, sessions })
    expect(user).toEqual({ id: userId, name: 'Lan', email: 'lan@example.com', createdAt: now.toISOString() })
    expect(user).not.toHaveProperty('passwordHash')
  })

  it('returns null without a token, for an unknown token, or when the user is gone', async () => {
    expect(await userFromToken(null, { users, sessions })).toBeNull()
    expect(await userFromToken('nope', { users, sessions })).toBeNull()
    const orphan = await sessions.create('deleted-user', new Date())
    expect(await userFromToken(orphan.token, { users, sessions })).toBeNull()
  })

  it('respects the clock for expiry', async () => {
    expect(await userFromToken(token, { users, sessions, now: () => new Date('2099-01-01') })).toBeNull()
  })
})

describe('getRequestUser', () => {
  it('reads the cookie header of a route request, using DATA_DIR stores by default', async () => {
    const request = new Request('http://shop.test', { headers: { cookie: `ls_session=${token}` } })
    expect((await getRequestUser(request))?.id).toBe(userId)
    expect(await getRequestUser(new Request('http://shop.test'))).toBeNull()
  })
})

describe('getCurrentUser', () => {
  it('reads the session cookie through next/headers', async () => {
    expect(await getCurrentUser()).toBeNull()
    cookieValue.value = token
    expect((await getCurrentUser())?.email).toBe('lan@example.com')
    cookieValue.value = 'bad token!'
    expect(await getCurrentUser()).toBeNull()
  })
})
