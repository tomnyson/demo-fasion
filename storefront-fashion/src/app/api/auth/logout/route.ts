import { clearedSessionCookie, readSessionToken } from '@/lib/auth/cookie'
import { authHeaders } from '@/lib/auth/session-response'
import { createSessionStore } from '@/lib/auth/sessions'
import { ok } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'

export const runtime = 'nodejs'

const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/auth/logout',
    limiter,
    allowEmptyBody: true,
    handle: async () => {
      const token = readSessionToken(request)
      if (token !== null) await createSessionStore().destroy(token)
      return ok({ signedOut: true }, 200, authHeaders(clearedSessionCookie()))
    },
  })
}
