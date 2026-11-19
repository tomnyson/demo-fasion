export interface RateLimitResult {
  readonly allowed: boolean
  readonly retryAfterSec: number
}

interface RateLimiterOptions {
  readonly limit: number
  readonly windowMs: number
  readonly now?: () => number
}

interface Window {
  readonly count: number
  readonly resetAt: number
}

const SWEEP_THRESHOLD = 1000

/** In-memory fixed-window limiter. State lives in the closure, so one limiter per process. */
export function createRateLimiter({ limit, windowMs, now = Date.now }: RateLimiterOptions) {
  const windows = new Map<string, Window>()

  function sweep(current: number): void {
    for (const [key, window] of windows) if (current >= window.resetAt) windows.delete(key)
  }

  return function hit(key: string): RateLimitResult {
    const current = now()
    if (windows.size >= SWEEP_THRESHOLD) sweep(current)
    const existing = windows.get(key)
    if (existing === undefined || current >= existing.resetAt) {
      windows.set(key, { count: 1, resetAt: current + windowMs })
      return { allowed: true, retryAfterSec: 0 }
    }
    if (existing.count >= limit) {
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - current) / 1000)) }
    }
    windows.set(key, { count: existing.count + 1, resetAt: existing.resetAt })
    return { allowed: true, retryAfterSec: 0 }
  }
}

const nonEmpty = (value: string | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed === undefined || trimmed === '' ? null : trimmed
}

/**
 * Rate-limit key for the caller's address. Uses the RIGHTMOST `X-Forwarded-For` entry (the one the
 * nearest proxy appended; earlier entries are client-controlled), then `X-Real-IP`, then 'unknown'.
 * The key is only trustworthy behind a reverse proxy that appends to / overwrites these headers;
 * without one, a client can send any value, so auth routes also limit per account (see login).
 */
export function clientKey(request: Request): string {
  const rightmost = request.headers.get('x-forwarded-for')?.split(',').at(-1)
  return nonEmpty(rightmost) ?? nonEmpty(request.headers.get('x-real-ip') ?? undefined) ?? 'unknown'
}
