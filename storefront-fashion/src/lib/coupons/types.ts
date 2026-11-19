export type CouponKind = 'percent' | 'fixed' | 'freeship'

export interface Coupon {
  /** Upper-case code the customer types. */
  readonly code: string
  /** Short Vietnamese description shown at checkout. */
  readonly label: string
  readonly kind: CouponKind
  /** Percent (1–100) for `percent`, VND for `fixed`, ignored for `freeship`. */
  readonly value: number
  /** Cap in VND for `percent` codes. */
  readonly maxDiscount?: number
  /** Minimum subtotal in VND before the code applies. */
  readonly minSubtotal?: number
  readonly startsAt?: string
  readonly endsAt?: string
  /** Total uses across all orders. */
  readonly usageLimit?: number
  /** Uses per signed-in customer; guests are only limited by `requiresAccount`. */
  readonly perUserLimit?: number
  /** Only signed-in customers may use it. */
  readonly requiresAccount?: boolean
  /** Shown as a suggestion at checkout. */
  readonly public?: boolean
}

export interface CouponContext {
  readonly subtotal: number
  readonly shipping: number
  readonly now: Date
  readonly signedIn: boolean
  /** Live (not cancelled) orders already placed with this code. */
  readonly usedCount: number
  /** Live orders this signed-in customer already placed with this code; 0 for guests. */
  readonly usedByUser: number
}

export type CouponResult =
  | { readonly ok: true; readonly coupon: Coupon; readonly discount: number; readonly shipping: number }
  | { readonly ok: false; readonly message: string }
