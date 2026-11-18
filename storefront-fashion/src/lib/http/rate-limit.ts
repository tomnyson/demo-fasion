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

export function clientKey(request: Request): string {
  const first = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return first === undefined || first === '' ? 'unknown' : first
}
