import { fail, ok } from '@/lib/http/api-response'
import { handleJsonPost } from '@/lib/http/json-post'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { createFileOrderRepository } from '@/lib/orders/repository'
import { placeOrder } from '@/lib/orders/service'

export const runtime = 'nodejs'

const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, {
    route: '/api/orders',
    limiter,
    handle: async (body) => {
      const result = await placeOrder(body, { repo: createFileOrderRepository(), now: () => new Date() })
      if (!result.ok) {
        return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.', fields: result.fields })
      }
      return ok({ code: result.order.code }, 201)
    },
  })
}
