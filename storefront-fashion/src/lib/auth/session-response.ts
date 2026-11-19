import { ok } from '@/lib/http/api-response'
import { sessionCookie } from './cookie'
import type { SessionStore } from './sessions'
import type { PublicUser } from './users'

/** Responses carrying user data or auth cookies must never be cached. */
export function authHeaders(setCookie?: string): Record<string, string> {
  return { 'Cache-Control': 'no-store', ...(setCookie === undefined ? {} : { 'Set-Cookie': setCookie }) }
}

/** Opens a session for `user` and answers with `{ user }` plus the session cookie. */
export async function signedInResponse(user: PublicUser, status: number, sessions: SessionStore, now: Date): Promise<Response> {
  const session = await sessions.create(user.id, now)
  return ok({ user }, status, authHeaders(sessionCookie(session.token, session.expiresAt)))
}
