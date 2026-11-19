import { createAddressRepository } from '@/lib/addresses/repository'
import { getRequestUser } from '@/lib/auth/current-user'
import { fail, ok } from '@/lib/http/api-response'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { createFileOrderRepository } from '@/lib/orders/repository'
import { placeOrder } from '@/lib/orders/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })

export function POST(request: Request): Promise<Response> {
  return handleJsonRoute(request, {
    route: '/api/orders',
    limiter,
    handle: async (body) => {
      const user = await getRequestUser(request)
      const result = await placeOrder(body, {
        repo: createFileOrderRepository(),
        addresses: createAddressRepository(),
        now: () => new Date(),
        ...(user === null ? {} : { userId: user.id }),
      })
      if (!result.ok) {
        return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.', fields: result.fields })
      }
      return ok({ code: result.order.code }, 201)
    },
  })
}
