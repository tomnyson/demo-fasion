import { createSessionStore } from '@/lib/auth/sessions'
import { createUserRepository } from '@/lib/auth/users'

let ip = 0
let n = 0

/** Same-origin JSON request with a fresh client IP, so tests never share a rate-limit bucket. */
export function jsonRequest(method: string, path: string, body?: unknown, extra: Record<string, string> = {}): Request {
  ip += 1
  const headers = { origin: 'http://shop.test', host: 'shop.test', 'content-type': 'application/json', 'x-forwarded-for': `10.2.${Math.floor(ip / 250)}.${ip % 250}`, ...extra }
  return new Request(`http://shop.test${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
}

export const PASSWORD = 'mat-khau-123'

/** Registers a user in the DATA_DIR stores and returns their id plus a session cookie header. */
export async function signedInUser(phone?: string): Promise<{ readonly userId: string; readonly cookie: string; readonly email: string }> {
  n += 1
  const email = `acc${n}-${Date.now()}@example.com`
  const created = await createUserRepository().register({ name: 'Lan Anh', email, password: PASSWORD, ...(phone === undefined ? {} : { phone }) })
  if (!created.ok) throw new Error('register failed')
  const session = await createSessionStore().create(created.user.id, new Date())
  return { userId: created.user.id, cookie: `ls_session=${session.token}`, email }
}

export const tokenOf = (response: Response): string => /ls_session=([^;]*)/.exec(response.headers.getSetCookie()[0] ?? '')?.[1] ?? ''
