import { fail, ok } from '@/lib/http/api-response'
import { handleJsonPost } from '@/lib/http/json-post'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { previewCoupon } from '@/lib/coupons/preview'
import { createFileOrderRepository } from '@/lib/orders/repository'

export const runtime = 'nodejs'

// Tight enough that guessing codes by brute force is impractical.
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, {
    route: '/api/coupons/preview',
    limiter,
    handle: async (body) => {
      const repo = createFileOrderRepository()
      const result = await previewCoupon(body, { countByCoupon: repo.countByCoupon, now: () => new Date() })
      if (!result.ok) {
        return fail(400, { code: 'VALIDATION', message: result.message, fields: { couponCode: result.message } })
      }
      return ok(result.preview)
    },
  })
}
