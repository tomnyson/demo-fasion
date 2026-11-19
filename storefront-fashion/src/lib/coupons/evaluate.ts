import { COUPONS } from '@/config/coupons'
import { formatVnd } from '@/lib/format'
import type { Coupon, CouponContext, CouponResult } from './types'

export const COUPON_MESSAGES = {
  unknown: 'Mã giảm giá không tồn tại.',
  expired: 'Mã giảm giá đã hết hạn.',
  notStarted: 'Mã giảm giá chưa đến thời gian sử dụng.',
  usedUp: 'Mã giảm giá đã hết lượt sử dụng.',
  membersOnly: 'Vui lòng đăng nhập để dùng mã này.',
} as const

const minimumMessage = (amount: number): string => `Đơn hàng chưa đạt giá trị tối thiểu ${formatVnd(amount)}.`

export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase()
}

export function findCoupon(code: string, coupons: readonly Coupon[] = COUPONS): Coupon | null {
  const wanted = normalizeCouponCode(code)
  return coupons.find((coupon) => coupon.code === wanted) ?? null
}

export function publicCoupons(coupons: readonly Coupon[] = COUPONS): readonly Coupon[] {
  return coupons.filter((coupon) => coupon.public === true)
}

/** Why a coupon cannot be used in this context, or null when it can. */
function rejection(coupon: Coupon, ctx: CouponContext): string | null {
  const now = ctx.now.getTime()
  if (coupon.startsAt !== undefined && now < Date.parse(coupon.startsAt)) return COUPON_MESSAGES.notStarted
  if (coupon.endsAt !== undefined && now > Date.parse(coupon.endsAt)) return COUPON_MESSAGES.expired
  if (coupon.requiresAccount === true && !ctx.signedIn) return COUPON_MESSAGES.membersOnly
  if (coupon.usageLimit !== undefined && ctx.usedCount >= coupon.usageLimit) return COUPON_MESSAGES.usedUp
  if (coupon.minSubtotal !== undefined && ctx.subtotal < coupon.minSubtotal) return minimumMessage(coupon.minSubtotal)
  return null
}

function productDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.kind === 'freeship') return 0
  const raw = coupon.kind === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
  const capped = coupon.maxDiscount === undefined ? raw : Math.min(raw, coupon.maxDiscount)
  return Math.max(0, Math.min(capped, subtotal))
}

/** Checks a code against the order and returns the product discount and the shipping fee to charge. */
export function evaluateCoupon(code: string, ctx: CouponContext, coupons: readonly Coupon[] = COUPONS): CouponResult {
  const coupon = findCoupon(code, coupons)
  if (coupon === null) return { ok: false, message: COUPON_MESSAGES.unknown }
  const message = rejection(coupon, ctx)
  if (message !== null) return { ok: false, message }
  return {
    ok: true,
    coupon,
    discount: productDiscount(coupon, ctx.subtotal),
    shipping: coupon.kind === 'freeship' ? 0 : ctx.shipping,
  }
}
