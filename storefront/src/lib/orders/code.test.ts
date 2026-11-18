import { describe, expect, it } from 'vitest'
import { generateOrderCode, ORDER_CODE_PATTERN } from './code'

describe('generateOrderCode', () => {
  it('formats VS-YYMMDD-XXXXXXXX using the UTC date', () => {
    const code = generateOrderCode(new Date('2026-11-18T03:00:00Z'), (n) => new Uint8Array(n))
    expect(code).toBe('VS-261118-AAAAAAAA')
    expect(ORDER_CODE_PATTERN.test(code)).toBe(true)
    expect(generateOrderCode(new Date('2026-12-31T23:30:00Z'), (n) => new Uint8Array(n))).toBe('VS-261231-AAAAAAAA')
  })

  it('maps bytes onto the alphabet and redraws biased bytes', () => {
    const draws = [new Uint8Array(8).fill(255), Uint8Array.from([1, 25, 26, 33, 34, 35, 237, 0])]
    const code = generateOrderCode(new Date('2026-11-18T00:00:00Z'), () => draws.shift()!)
    expect(code).toBe('VS-261118-BZ29AB9A')
  })

  it('gives up if the random source only yields rejected bytes', () => {
    expect(() => generateOrderCode(new Date(), (n) => new Uint8Array(n).fill(255))).toThrow()
  })

  it('rejects malformed codes', () => {
    expect(ORDER_CODE_PATTERN.test('VS-261118-aaaa')).toBe(false)
    expect(ORDER_CODE_PATTERN.test('../../etc/passwd')).toBe(false)
    expect(ORDER_CODE_PATTERN.test('VS-261118-AAAAAAAA\n')).toBe(false)
  })

  it('is unique across 200 codes with the default random source', () => {
    expect(new Set(Array.from({ length: 200 }, () => generateOrderCode(new Date()))).size).toBe(200)
  })
})
