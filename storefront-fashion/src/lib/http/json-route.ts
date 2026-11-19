import { fail } from '@/lib/http/api-response'
import { clientKey, type RateLimitResult } from '@/lib/http/rate-limit'
import { isSameOrigin } from '@/lib/http/same-origin'

export const MAX_BODY_CHARS = 20_000

export interface JsonRouteOptions {
  /** Route path used in the server log label, e.g. `/api/orders`. */
  readonly route: string
  readonly limiter: (key: string) => RateLimitResult
  /** Receives the parsed JSON body (or `undefined` for an allowed empty body) and the request, for cookies. */
  readonly handle: (body: unknown, request: Request) => Promise<Response>
  /** Accept a request without a body (e.g. DELETE, logout); the handler then gets `undefined`. */
  readonly allowEmptyBody?: boolean
}

type ParsedBody = { readonly ok: true; readonly body: unknown } | { readonly ok: false }

async function readJsonBody(request: Request, allowEmpty: boolean): Promise<ParsedBody> {
  const text = await request.text()
  if (text.length > MAX_BODY_CHARS) return { ok: false }
  if (allowEmpty && text.trim() === '') return { ok: true, body: undefined }
  try {
    return { ok: true, body: JSON.parse(text) as unknown }
  } catch {
    return { ok: false }
  }
}

/** The shared 429 envelope with a `Retry-After` header. */
export function rateLimited(retryAfterSec: number): Response {
  return fail(
    429,
    { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' },
    { 'Retry-After': String(retryAfterSec) },
  )
}

/**
 * Shared guard for state-changing JSON routes (POST, PATCH, DELETE): same-origin check, rate limit,
 * bounded JSON parse, then the handler. Unexpected errors are logged and become a generic 500.
 */
export async function handleJsonRoute(request: Request, { route, limiter, handle, allowEmptyBody = false }: JsonRouteOptions): Promise<Response> {
  try {
    if (!isSameOrigin(request)) return fail(403, { code: 'FORBIDDEN', message: 'Yêu cầu không hợp lệ.' })
    const limit = limiter(clientKey(request))
    if (!limit.allowed) return rateLimited(limit.retryAfterSec)
    const parsed = await readJsonBody(request, allowEmptyBody)
    if (!parsed.ok) return fail(400, { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.' })
    return await handle(parsed.body, request)
  } catch (error) {
    console.error(`[${request.method} ${route}] unexpected error`, { client: clientKey(request), error })
    return fail(500, { code: 'INTERNAL', message: 'Có lỗi xảy ra. Vui lòng thử lại.' })
  }
}
