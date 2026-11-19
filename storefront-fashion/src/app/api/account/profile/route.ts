import { invalid, unauthorized, withRequestUser } from '@/lib/account/route-auth'
import { profileSchema } from '@/lib/auth/schema'
import { authHeaders } from '@/lib/auth/session-response'
import { createUserRepository, toPublicUser } from '@/lib/auth/users'
import { ok } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { parseInput } from '@/lib/validation/parse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 })

/** Updates name and phone. An empty phone removes it. */
export function PATCH(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/account/profile',
    limiter,
    handle: (body) =>
      withRequestUser(request, async (user) => {
        const parsed = parseInput(profileSchema, body)
        if (!parsed.ok) return invalid(parsed.fields)
        const updated = await createUserRepository().update(user.id, { name: parsed.data.name, phone: parsed.data.phone ?? null })
        return updated === null ? unauthorized() : ok({ user: toPublicUser(updated) }, 200, authHeaders())
      }),
  })
}
