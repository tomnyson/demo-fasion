import { cookies } from 'next/headers'
import { parseSessionToken, readSessionToken, SESSION_COOKIE } from './cookie'
import { createSessionStore, type SessionStore } from './sessions'
import { createUserRepository, toPublicUser, type PublicUser, type UserRepository } from './users'

export interface AuthDeps {
  readonly users?: UserRepository
  readonly sessions?: SessionStore
  readonly now?: () => Date
}

/** Resolves a raw session token to its user; stores default to the DATA_DIR files at call time. */
export async function userFromToken(token: string | null, deps: AuthDeps = {}): Promise<PublicUser | null> {
  if (token === null) return null
  const { users = createUserRepository(), sessions = createSessionStore(), now = () => new Date() } = deps
  const userId = await sessions.resolve(token, now())
  if (userId === null) return null
  const user = await users.findById(userId)
  return user === null ? null : toPublicUser(user)
}

/** Route handlers: read the session from the request's Cookie header (works outside Next's request scope too). */
export function getRequestUser(request: Request, deps?: AuthDeps): Promise<PublicUser | null> {
  return userFromToken(readSessionToken(request), deps)
}

/** Server components and layouts: read the session via `cookies()`. Makes the calling route dynamic. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies()
  return userFromToken(parseSessionToken(store.get(SESSION_COOKIE)?.value))
}
