import { z } from 'zod'
import { sanitizeLines } from '@/lib/cart/storage'
import { computeTotals } from '@/lib/cart/totals'
import { couponCodeSchema, linesSchema, MESSAGES } from '@/lib/orders/schema'
import type { CouponUsage } from '@/lib/orders/repository'
import { evaluateCoupon } from './evaluate'

export interface CouponPreview {
  readonly code: string
  readonly label: string
  readonly discount: number
  readonly shipping: number
  readonly total: number
}

export type CouponPreviewResult = { ok: true; preview: CouponPreview } | { ok: false; message: string }

export interface CouponPreviewDeps {
  readonly couponUsage: (code: string, userId?: string) => Promise<CouponUsage>
  readonly now: () => Date
  readonly userId?: string
}

const previewSchema = z.object({ code: couponCodeSchema, lines: linesSchema })

/** Prices the cart with a code so checkout can show the discount; placeOrder re-checks everything. */
export async function previewCoupon(input: unknown, deps: CouponPreviewDeps): Promise<CouponPreviewResult> {
  const parsed = previewSchema.safeParse(input)
  if (!parsed.success) {
    const onCode = parsed.error.issues.some((issue) => issue.path[0] === 'code')
    return { ok: false, message: onCode ? MESSAGES.couponCode : MESSAGES.lines }
  }
  const { code, lines } = parsed.data
  if (code === undefined) return { ok: false, message: 'Vui lòng nhập mã giảm giá.' }
  const totals = computeTotals(sanitizeLines(lines))
  if (totals.lines.length === 0) return { ok: false, message: MESSAGES.lines }

  const usage = await deps.couponUsage(code, deps.userId)
  const result = evaluateCoupon(code, {
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    now: deps.now(),
    signedIn: deps.userId !== undefined,
    usedCount: usage.total,
    usedByUser: usage.byUser,
  })
  if (!result.ok) return result
  return {
    ok: true,
    preview: {
      code: result.coupon.code,
      label: result.coupon.label,
      discount: result.discount,
      shipping: result.shipping,
      total: Math.max(0, totals.subtotal - result.discount) + result.shipping,
    },
  }
}
