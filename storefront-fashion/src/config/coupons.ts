import type { Coupon } from '@/lib/coupons/types'

// Demo discount codes. Edit this list to add, change or retire codes (dates are ISO, UTC).
export const COUPONS: readonly Coupon[] = Object.freeze([
  {
    code: 'LASTUDIO10',
    label: 'Giảm 10%, tối đa 50.000đ cho đơn từ 300.000đ',
    kind: 'percent',
    value: 10,
    maxDiscount: 50000,
    minSubtotal: 300000,
    endsAt: '2027-12-31T16:59:59.000Z',
    public: true,
  },
  {
    code: 'GIAM50K',
    label: 'Giảm 50.000đ cho đơn từ 500.000đ',
    kind: 'fixed',
    value: 50000,
    minSubtotal: 500000,
    usageLimit: 100,
    endsAt: '2027-12-31T16:59:59.000Z',
    public: true,
  },
  {
    code: 'FREESHIP',
    label: 'Miễn phí giao hàng',
    kind: 'freeship',
    value: 0,
    endsAt: '2027-12-31T16:59:59.000Z',
    public: true,
  },
  {
    code: 'THANHVIEN15',
    label: 'Giảm 15% cho thành viên, tối đa 100.000đ',
    kind: 'percent',
    value: 15,
    maxDiscount: 100000,
    requiresAccount: true,
    public: false,
  },
] satisfies Coupon[])

export const MAX_COUPON_CODE_LENGTH = 32
