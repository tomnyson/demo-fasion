import { notFound, withRequestUser } from '@/lib/account/route-auth'
import { authHeaders } from '@/lib/auth/session-response'
import { fail, ok } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { cancelOrderForUser, ORDER_NOT_FOUND } from '@/lib/orders/cancel'
import { ORDER_CODE_PATTERN } from '@/lib/orders/code'
import { createFileOrderRepository } from '@/lib/orders/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

interface RouteContext {
  readonly params: Promise<{ code: string }>
}

async function cancel(userId: string, code: string): Promise<Response> {
  if (!ORDER_CODE_PATTERN.test(code)) return notFound(ORDER_NOT_FOUND)
  const result = await cancelOrderForUser(createFileOrderRepository(), userId, code, new Date())
  if (result.ok) return ok({ code: result.order.code, status: result.order.status }, 200, authHeaders())
  if (result.reason === 'not_found') return notFound(ORDER_NOT_FOUND)
  return fail(409, { code: 'CONFLICT', message: result.message }, authHeaders())
}

/** POST /api/account/orders/:code/cancel — the signed-in customer cancels their own pending order. */
export async function POST(request: Request, { params }: RouteContext): Promise<Response> {
  const { code } = await params
  return handleJsonRoute(request, {
    route: '/api/account/orders/[code]/cancel',
    limiter,
    allowEmptyBody: true,
    handle: () => withRequestUser(request, (user) => cancel(user.id, code)),
  })
}
