export const DEFAULT_NEXT = '/tai-khoan'
const MAX_NEXT_LENGTH = 512

/**
 * Only same-site paths survive: must start with a single `/`, with no backslash, whitespace or control
 * characters (browsers drop tabs/newlines, so `/\t/evil.com` would become `//evil.com`).
 */
export function safeNext(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > MAX_NEXT_LENGTH) return DEFAULT_NEXT
  if (!raw.startsWith('/') || raw.startsWith('//')) return DEFAULT_NEXT
  if (/[\\\s\u0000-\u001f\u007f]/.test(raw)) return DEFAULT_NEXT
  return raw
}
