import { registerSchema } from '@/lib/auth/schema'
import { signedInResponse } from '@/lib/auth/session-response'
import { createSessionStore } from '@/lib/auth/sessions'
import { createUserRepository } from '@/lib/auth/users'
import { fail } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { parseInput } from '@/lib/validation/parse'

export const runtime = 'nodejs'

const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/auth/register',
    limiter,
    handle: async (body) => {
      const parsed = parseInput(registerSchema, body)
      if (!parsed.ok) return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.', fields: parsed.fields })
      const result = await createUserRepository().register(parsed.data)
      if (!result.ok) return fail(409, { code: 'VALIDATION', message: result.fields.email, fields: result.fields })
      return signedInResponse(result.user, 201, createSessionStore(), new Date())
    },
  })
}
