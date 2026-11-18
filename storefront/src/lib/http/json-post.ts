import { fail } from '@/lib/http/api-response'
import { clientKey, type RateLimitResult } from '@/lib/http/rate-limit'
import { isSameOrigin } from '@/lib/http/same-origin'

export const MAX_BODY_CHARS = 20_000

export interface JsonPostOptions {
  /** Route path used in the server log label, e.g. `/api/orders`. */
  readonly route: string
  readonly limiter: (key: string) => RateLimitResult
  /** Receives the parsed JSON body and builds the success (or validation failure) response. */
  readonly handle: (body: unknown) => Promise<Response>
}

type ParsedBody = { readonly ok: true; readonly body: unknown } | { readonly ok: false }

async function readJsonBody(request: Request): Promise<ParsedBody> {
  const text = await request.text()
  if (text.length > MAX_BODY_CHARS) return { ok: false }
  try {
    return { ok: true, body: JSON.parse(text) as unknown }
  } catch {
    return { ok: false }
  }
}

/** Same-origin check, rate limit, bounded JSON parse, then the route handler; unexpected errors become a generic 500. */
export async function handleJsonPost(request: Request, { route, limiter, handle }: JsonPostOptions): Promise<Response> {
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
    if (!parsed.ok) return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.' })

    return await handle(parsed.body)
  } catch (error) {
    console.error(`[POST ${route}] unexpected error`, { client: clientKey(request), error })
    return fail(500, { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' })
  }
}
