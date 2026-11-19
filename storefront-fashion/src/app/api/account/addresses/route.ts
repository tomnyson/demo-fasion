import { invalid, withRequestUser } from '@/lib/account/route-auth'
import { createAddressRepository } from '@/lib/addresses/repository'
import { bookResponse } from '@/lib/addresses/responses'
import { addressInputSchema } from '@/lib/addresses/schema'
import { authHeaders } from '@/lib/auth/session-response'
import { fail } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { clientKey, createRateLimiter } from '@/lib/http/rate-limit'
import { parseInput } from '@/lib/validation/parse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 })

/** The signed-in user's address book, default first. */
export async function GET(request: Request): Promise<Response> {
  try {
    return await withRequestUser(request, (user) => bookResponse(createAddressRepository(), user.id))
  } catch (error) {
    console.error('[GET /api/account/addresses] unexpected error', { client: clientKey(request), error })
    return fail(500, { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' }, authHeaders())
  }
}

export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/account/addresses',
    limiter,
    handle: (body) =>
      withRequestUser(request, async (user) => {
        const parsed = parseInput(addressInputSchema, body)
        if (!parsed.ok) return invalid(parsed.fields)
        const repo = createAddressRepository()
        const added = await repo.add(user.id, parsed.data)
        if (!added.ok) return fail(409, { code: 'VALIDATION', message: added.message, fields: { form: added.message } }, authHeaders())
        return bookResponse(repo, user.id, added.address, 201)
      }),
  })
}
