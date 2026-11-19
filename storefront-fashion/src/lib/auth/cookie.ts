export const SESSION_COOKIE = 'ls_session'

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

function serialize(value: string, expiry: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE}=${value}; Path=/; ${expiry}; HttpOnly; SameSite=Lax${secure}`
}

/** `Set-Cookie` value for a new session (A7: httpOnly, SameSite=Lax, Path=/, Secure in production). */
export function sessionCookie(token: string, expiresAt: Date): string {
  return serialize(token, `Expires=${expiresAt.toUTCString()}`)
}

/** `Set-Cookie` value that removes the session cookie. */
export function clearedSessionCookie(): string {
  return serialize('', `Expires=${new Date(0).toUTCString()}; Max-Age=0`)
}

/** Validates a raw cookie value; returns null for anything that cannot be one of our tokens. */
export function parseSessionToken(raw: string | undefined): string | null {
  return raw !== undefined && TOKEN_PATTERN.test(raw) ? raw : null
}

/** Reads the session token straight from a request's Cookie header (route handlers). */
export function readSessionToken(request: Request): string | null {
  const header = request.headers.get('cookie') ?? ''
  const pair = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
  return parseSessionToken(pair?.slice(SESSION_COOKIE.length + 1))
}
