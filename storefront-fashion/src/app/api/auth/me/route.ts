import { getRequestUser } from '@/lib/auth/current-user'
import { authHeaders } from '@/lib/auth/session-response'
import { fail, ok } from '@/lib/http/api-response'
import { clientKey } from '@/lib/http/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Who is signed in, for client UI such as the header link. Never cached. */
export async function GET(request: Request): Promise<Response> {
  try {
    return ok({ user: await getRequestUser(request) }, 200, authHeaders())
  } catch (error) {
    console.error('[GET /api/auth/me] unexpected error', { client: clientKey(request), error })
    return fail(500, { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' }, authHeaders())
  }
}
