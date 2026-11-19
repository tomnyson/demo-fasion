import { appendFile, mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSessionStore, hashToken, SESSION_TTL_MS, type SessionStore } from './sessions'

let dir: string
let file: string
let sessions: SessionStore
const now = new Date('2026-11-19T08:00:00.000Z')
const later = (ms: number) => new Date(now.getTime() + ms)

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'sessions-'))
  file = join(dir, 'sessions.jsonl')
  sessions = createSessionStore(file)
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('createSessionStore', () => {
  it('issues a 32-byte base64url token that resolves to its user', async () => {
    const { token, expiresAt } = await sessions.create('u1', now)
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(expiresAt.getTime()).toBe(now.getTime() + SESSION_TTL_MS)
    expect(await sessions.resolve(token, now)).toBe('u1')
  })

  it('stores only the sha256 of the token', async () => {
    const { token } = await sessions.create('u1', now)
    const text = await readFile(file, 'utf8')
    expect(text).not.toContain(token)
    expect(text).toContain(hashToken(token))
  })

  it('expires after 30 days', async () => {
    const { token } = await sessions.create('u1', now)
    expect(await sessions.resolve(token, later(SESSION_TTL_MS - 1))).toBe('u1')
    expect(await sessions.resolve(token, later(SESSION_TTL_MS))).toBeNull()
  })

  it.each([['unknown', 'x'.repeat(43)], ['empty', ''], ['oversized', 'x'.repeat(500)]])('resolves a %s token to null', async (_name, token) => {
    expect(await sessions.resolve(token, now)).toBeNull()
  })

  it('destroy ends one session', async () => {
    const a = await sessions.create('u1', now)
    const b = await sessions.create('u1', now)
    await sessions.destroy(a.token)
    expect(await sessions.resolve(a.token, now)).toBeNull()
    expect(await sessions.resolve(b.token, now)).toBe('u1')
  })

  it('compacts the file to live, unexpired sessions once it grows past the line limit', async () => {
    const small = createSessionStore(file, { compactAfterLines: 5 })
    const expired = await small.create('u1', later(-SESSION_TTL_MS - 1))
    const destroyed = await small.create('u1', now)
    await small.destroy(destroyed.token)
    const live = await small.create('u2', now)
    await appendFile(file, 'garbage\n')
    expect((await readFile(file, 'utf8')).trim().split('\n')).toHaveLength(5)
    const fresh = await small.create('u3', now)
    const lines = (await readFile(file, 'utf8')).trim().split('\n')
    expect(lines.map((line) => JSON.parse(line).id)).toEqual([hashToken(live.token), hashToken(fresh.token)])
    expect(await small.resolve(live.token, now)).toBe('u2')
    expect(await small.resolve(fresh.token, now)).toBe('u3')
    expect(await small.resolve(expired.token, now)).toBeNull()
    expect(await small.resolve(destroyed.token, now)).toBeNull()
    expect(await readdir(dir)).toEqual(['sessions.jsonl'])
  })

  it('destroyAllFor ends every session of one user only', async () => {
    const a = await sessions.create('u1', now)
    const b = await sessions.create('u1', now)
    const other = await sessions.create('u2', now)
    await sessions.destroyAllFor('u1')
    expect(await sessions.resolve(a.token, now)).toBeNull()
    expect(await sessions.resolve(b.token, now)).toBeNull()
    expect(await sessions.resolve(other.token, now)).toBe('u2')
  })
})
