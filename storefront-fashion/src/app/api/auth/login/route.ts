import { checkCredentials, INVALID_CREDENTIALS } from '@/lib/auth/credentials'
import { loginSchema } from '@/lib/auth/schema'
import { signedInResponse } from '@/lib/auth/session-response'
import { createSessionStore } from '@/lib/auth/sessions'
import { createUserRepository, toPublicUser } from '@/lib/auth/users'
import { fail } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { parseInput } from '@/lib/validation/parse'

export const runtime = 'nodejs'

// 10 attempts per minute per client keeps password guessing slow.
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/auth/login',
    limiter,
    handle: async (body) => {
      const parsed = parseInput(loginSchema, body)
      if (!parsed.ok) return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.', fields: parsed.fields })
      const user = await checkCredentials(createUserRepository(), parsed.data.email, parsed.data.password)
      if (user === null) return fail(401, { code: 'UNAUTHORIZED', message: INVALID_CREDENTIALS })
      return signedInResponse(toPublicUser(user), 200, createSessionStore(), new Date())
    },
  })
}
