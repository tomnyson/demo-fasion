import { describe, expect, it } from 'vitest'
import { DEFAULT_NEXT, safeNext } from './safe-next'

describe('safeNext', () => {
  it.each([
    ['/tai-khoan/don-hang', '/tai-khoan/don-hang'],
    ['/thanh-toan?step=2#top', '/thanh-toan?step=2#top'],
    ['/', '/'],
  ])('keeps the local path %s', (raw, expected) => {
    expect(safeNext(raw)).toBe(expected)
  })

  it.each([
    ['absolute URL', 'https://evil.com'],
    ['protocol-relative', '//evil.com'],
    ['backslash', '/\\evil.com'],
    ['tab trick', '/\t/evil.com'],
    ['newline', '/\n/evil.com'],
    ['space', '/ /evil.com'],
    ['relative', 'tai-khoan'],
    ['javascript', 'javascript:alert(1)'],
    ['empty', ''],
    ['too long', `/${'a'.repeat(600)}`],
    ['missing', undefined],
    ['array', ['/tai-khoan', '/x']],
  ])('falls back for %s', (_name, raw) => {
    expect(safeNext(raw)).toBe(DEFAULT_NEXT)
  })

  it('uses /tai-khoan as the fallback', () => {
    expect(DEFAULT_NEXT).toBe('/tai-khoan')
  })
})
