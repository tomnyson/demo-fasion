import { getRequestUser } from '@/lib/auth/current-user'
import { authHeaders } from '@/lib/auth/session-response'
import { previewCoupon } from '@/lib/coupons/preview'
import { fail, ok } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { createFileOrderRepository } from '@/lib/orders/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Tight enough that guessing codes by brute force is impractical.
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/coupons/preview',
    limiter,
    handle: async (body) => {
      const user = await getRequestUser(request)
      const repo = createFileOrderRepository()
      const result = await previewCoupon(body, {
        couponUsage: repo.couponUsage,
        now: () => new Date(),
        ...(user === null ? {} : { userId: user.id }),
      })
      if (!result.ok) {
        return fail(400, { code: 'VALIDATION', message: result.message, fields: { couponCode: result.message } }, authHeaders())
      }
      return ok(result.preview, 200, authHeaders())
    },
  })
}
