import { randomUUID } from 'node:crypto'
import { createCollection } from '@/lib/storage/collection'
import { dataPath } from '@/lib/storage/jsonl-store'
import { hashPassword } from './password'

export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly phone?: string
  readonly passwordHash: string
  readonly createdAt: string
}

export type PublicUser = Omit<User, 'passwordHash'>

export interface NewUserInput {
  readonly email: string
  readonly name: string
  readonly phone?: string
  readonly password: string
}

/** `phone: null` clears the phone number. */
export interface UserPatch {
  readonly name?: string
  readonly phone?: string | null
  readonly passwordHash?: string
}

export type RegisterResult =
  | { readonly ok: true; readonly user: PublicUser }
  | { readonly ok: false; readonly fields: { readonly email: string } }

export interface UserRepository {
  register(input: NewUserInput, now?: Date): Promise<RegisterResult>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  update(id: string, patch: UserPatch): Promise<User | null>
}

export const USERS_FILE = 'users.jsonl'
export const EMAIL_TAKEN = 'Email đã được sử dụng.'

export const normalizeEmail = (email: string): string => email.trim().toLowerCase()

export function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user
  return rest
}

function applyPatch(user: User, patch: UserPatch): User {
  const { phone, ...base } = user
  const nextPhone = patch.phone === undefined ? phone : (patch.phone ?? undefined)
  return {
    ...base,
    ...(patch.name === undefined ? {} : { name: patch.name }),
    ...(patch.passwordHash === undefined ? {} : { passwordHash: patch.passwordHash }),
    ...(nextPhone === undefined ? {} : { phone: nextPhone }),
  }
}

export function createUserRepository(filePath: string = dataPath(USERS_FILE)): UserRepository {
  const users = createCollection<User>(filePath)
  return {
    async register(input, now = new Date()) {
      // Hash before taking the lock: scrypt is slow and the duplicate check does not need it.
      const passwordHash = await hashPassword(input.password)
      const user: User = {
        id: randomUUID(),
        email: normalizeEmail(input.email),
        name: input.name,
        ...(input.phone === undefined ? {} : { phone: input.phone }),
        passwordHash,
        createdAt: now.toISOString(),
      }
      return users.mutate<RegisterResult>((all) =>
        all.some((existing) => existing.email === user.email)
          ? { writes: [], result: { ok: false, fields: { email: EMAIL_TAKEN } } }
          : { writes: [user], result: { ok: true, user: toPublicUser(user) } },
      )
    },
    async findByEmail(email) {
      const wanted = normalizeEmail(email)
      return (await users.all()).find((user) => user.email === wanted) ?? null
    },
    findById: (id) => users.get(id),
    update: (id, patch) =>
      users.mutate((all) => {
        const current = all.find((user) => user.id === id)
        if (current === undefined) return { writes: [], result: null }
        const next = applyPatch(current, patch)
        return { writes: [next], result: next }
      }),
  }
}
