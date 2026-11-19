import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkCredentials, INVALID_CREDENTIALS } from './credentials'
import { createUserRepository, type UserRepository } from './users'

let dir: string
let users: UserRepository

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'credentials-'))
  users = createUserRepository(join(dir, 'users.jsonl'))
  await users.register({ name: 'Lan', email: 'lan@example.com', password: '12345678' })
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('checkCredentials', () => {
  it('returns the user for the right email and password', async () => {
    expect((await checkCredentials(users, 'LAN@example.com', '12345678'))?.email).toBe('lan@example.com')
  })

  it('returns null for an unknown email or a wrong password', async () => {
    expect(await checkCredentials(users, 'ghost@example.com', '12345678')).toBeNull()
    expect(await checkCredentials(users, 'lan@example.com', 'wrong-pass')).toBeNull()
  })

  it('has one message for both failures', () => {
    expect(INVALID_CREDENTIALS).toBe('Email hoặc mật khẩu không đúng.')
  })
})
