import { invalid, unauthorized, withRequestUser } from '@/lib/account/route-auth'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { passwordChangeSchema } from '@/lib/auth/schema'
import { signedInResponse } from '@/lib/auth/session-response'
import { createSessionStore } from '@/lib/auth/sessions'
import { createUserRepository, toPublicUser } from '@/lib/auth/users'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { parseInput } from '@/lib/validation/parse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WRONG_CURRENT_PASSWORD = 'Mật khẩu hiện tại không đúng.'

// The route confirms whether a password is right, so it is limited like login.
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

/** Changes the password, signs out every session of the user, then opens a fresh one for this device. */
export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/account/password',
    limiter,
    handle: (body) =>
      withRequestUser(request, async (user) => {
        const parsed = parseInput(passwordChangeSchema, body)
        if (!parsed.ok) return invalid(parsed.fields)
        const users = createUserRepository()
        const stored = await users.findById(user.id)
        if (stored === null) return unauthorized()
        if (!(await verifyPassword(parsed.data.currentPassword, stored.passwordHash))) return invalid({ currentPassword: WRONG_CURRENT_PASSWORD })
        const updated = await users.update(user.id, { passwordHash: await hashPassword(parsed.data.newPassword) })
        if (updated === null) return unauthorized()
        const sessions = createSessionStore()
        await sessions.destroyAllFor(user.id)
        return signedInResponse(toPublicUser(updated), 200, sessions, new Date())
      }),
  })
}
