import { fail, ok } from '@/lib/http/api-response'
import { clientKey, createRateLimiter } from '@/lib/http/rate-limit'
import { isSameOrigin } from '@/lib/http/same-origin'
import { createFileQuoteRepository } from '@/lib/quotes/repository'
import { submitQuote } from '@/lib/quotes/service'

export const runtime = 'nodejs'

const MAX_BODY_CHARS = 20_000
const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })

const invalidBody = () => fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.' })

async function readJsonBody(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  const text = await request.text()
  if (text.length > MAX_BODY_CHARS) return { ok: false }
  try {
    return { ok: true, body: JSON.parse(text) as unknown }
  } catch {
    return { ok: false }
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (!isSameOrigin(request)) return fail(403, { code: 'FORBIDDEN', message: 'Yêu cầu không hợp lệ.' })

    const limit = limiter(clientKey(request))
    if (!limit.allowed) {
      return fail(
        429,
        { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' },
        { 'Retry-After': String(limit.retryAfterSec) },
      )
    }

    const parsed = await readJsonBody(request)
    if (!parsed.ok) return invalidBody()

    const result = await submitQuote(parsed.body, { repo: createFileQuoteRepository(), now: () => new Date() })
    if (!result.ok) {
      return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.', fields: result.fields })
    }
    return ok({ received: true }, 201)
  } catch (error) {
    console.error('[POST /api/quotes] unexpected error', { client: clientKey(request), error })
    return fail(500, { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' })
  }
}
