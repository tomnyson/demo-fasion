import { describe, expect, it } from 'vitest'
import { COUPONS } from '@/config/coupons'
import { COUPON_MESSAGES, evaluateCoupon, findCoupon, normalizeCouponCode, publicCoupons } from './evaluate'
import type { Coupon, CouponContext } from './types'

const NOW = new Date('2026-11-19T03:00:00Z')
const ctx = (patch: Partial<CouponContext> = {}): CouponContext => ({
  subtotal: 400000,
  shipping: 30000,
  now: NOW,
  signedIn: false,
  usedCount: 0,
  ...patch,
})

const list: readonly Coupon[] = [
  { code: 'PCT', label: 'p', kind: 'percent', value: 10, maxDiscount: 30000, minSubtotal: 200000 },
  { code: 'FIX', label: 'f', kind: 'fixed', value: 500000 },
  { code: 'SHIP', label: 's', kind: 'freeship', value: 0 },
  { code: 'OLD', label: 'o', kind: 'fixed', value: 1000, endsAt: '2026-11-18T00:00:00Z' },
  { code: 'SOON', label: 'n', kind: 'fixed', value: 1000, startsAt: '2026-12-01T00:00:00Z' },
  { code: 'LIMIT', label: 'l', kind: 'fixed', value: 1000, usageLimit: 2 },
  { code: 'MEMBER', label: 'm', kind: 'fixed', value: 1000, requiresAccount: true },
]

describe('normalizeCouponCode', () => {
  it('trims and upper-cases', () => {
    expect(normalizeCouponCode('  lastudio10 ')).toBe('LASTUDIO10')
  })
})

describe('evaluateCoupon', () => {
  it('applies a percent code with its cap', () => {
    expect(evaluateCoupon('pct', ctx({ subtotal: 250000 }), list)).toMatchObject({ ok: true, discount: 25000, shipping: 30000 })
    expect(evaluateCoupon('PCT', ctx({ subtotal: 900000 }), list)).toMatchObject({ ok: true, discount: 30000 })
  })

  it('never discounts more than the subtotal', () => {
    expect(evaluateCoupon('FIX', ctx({ subtotal: 229000 }), list)).toMatchObject({ ok: true, discount: 229000, shipping: 30000 })
  })

  it('zeroes the shipping fee for a freeship code', () => {
    expect(evaluateCoupon('SHIP', ctx(), list)).toMatchObject({ ok: true, discount: 0, shipping: 0 })
  })

  it('rejects unknown, expired, not-yet-started, below-minimum, used-up and member-only codes', () => {
    const fail = (code: string, patch: Partial<CouponContext> = {}) => {
      const result = evaluateCoupon(code, ctx(patch), list)
      return result.ok ? null : result.message
    }
    expect(fail('NOPE')).toBe(COUPON_MESSAGES.unknown)
    expect(fail('')).toBe(COUPON_MESSAGES.unknown)
    expect(fail('OLD')).toBe(COUPON_MESSAGES.expired)
    expect(fail('SOON')).toBe(COUPON_MESSAGES.notStarted)
    expect(fail('PCT', { subtotal: 199000 })).toBe('Đơn hàng chưa đạt giá trị tối thiểu 200.000 ₫.')
    expect(fail('LIMIT', { usedCount: 2 })).toBe(COUPON_MESSAGES.usedUp)
    expect(fail('LIMIT', { usedCount: 1 })).toBeNull()
    expect(fail('MEMBER')).toBe(COUPON_MESSAGES.membersOnly)
    expect(fail('MEMBER', { signedIn: true })).toBeNull()
  })
})

describe('shipped coupon list', () => {
  it('has unique upper-case codes and only suggests public ones', () => {
    const codes = COUPONS.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes.every((c) => c === normalizeCouponCode(c))).toBe(true)
    expect(publicCoupons().map((c) => c.code)).toEqual(['LASTUDIO10', 'GIAM50K', 'FREESHIP'])
    expect(findCoupon('freeship')?.kind).toBe('freeship')
  })

  it('LASTUDIO10 is valid today for a 300.000đ order', () => {
    expect(evaluateCoupon('LASTUDIO10', ctx({ subtotal: 300000 }))).toMatchObject({ ok: true, discount: 30000 })
  })
})
