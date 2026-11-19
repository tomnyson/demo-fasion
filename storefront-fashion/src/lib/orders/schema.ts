import { z } from 'zod'
import { MAX_LINE_QTY } from '@/config/commerce'
import { MAX_COUPON_CODE_LENGTH } from '@/config/coupons'
import type { CartLine } from '@/lib/cart/types'
import { boundedText, CONTACT_MESSAGES, emptyToUndefined, nameField, phoneField } from '@/lib/validation/contact'

export interface OrderInput {
  customer: { name: string; phone: string; email?: string; province: string; address: string; note?: string }
  payment: 'cod' | 'bank'
  lines: CartLine[]
  couponCode?: string
}

export interface Order {
  readonly code: string
  readonly createdAt: string
  readonly customer: OrderInput['customer']
  readonly payment: 'cod' | 'bank'
  readonly lines: readonly {
    productId: string
    name: string
    size: string
    color: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
  readonly subtotal: number
  /** Product discount from the coupon; absent on orders placed before coupons existed. */
  readonly discount?: number
  readonly couponCode?: string
  readonly shipping: number
  readonly total: number
}

export type PublicOrder = Omit<Order, 'customer'>

export const MESSAGES = {
  name: CONTACT_MESSAGES.name,
  phone: CONTACT_MESSAGES.phone,
  email: 'Email không hợp lệ.',
  province: 'Vui lòng chọn tỉnh/thành.',
  address: 'Vui lòng nhập địa chỉ (5–200 ký tự).',
  note: 'Ghi chú tối đa 500 ký tự.',
  lines: 'Giỏ hàng không hợp lệ.',
  couponCode: 'Mã giảm giá không hợp lệ.',
} as const

const MAX_ORDER_LINES = 50

const email = z
  .string({ error: MESSAGES.email })
  .trim()
  .transform(emptyToUndefined)
  .pipe(z.email({ error: MESSAGES.email }).max(254, { error: MESSAGES.email }).optional())
  .optional()

const note = z
  .string({ error: MESSAGES.note })
  .trim()
  .max(500, { error: MESSAGES.note })
  .transform(emptyToUndefined)
  .optional()

export const couponCodeSchema = z
  .string({ error: MESSAGES.couponCode })
  .trim()
  .max(MAX_COUPON_CODE_LENGTH, { error: MESSAGES.couponCode })
  .transform((value) => emptyToUndefined(value.toUpperCase()))
  .optional()

export const lineSchema = z.object(
  {
    productId: z.string({ error: MESSAGES.lines }).max(64, { error: MESSAGES.lines }),
    size: z.enum(['S', 'M', 'L', 'XL', 'XXL'], { error: MESSAGES.lines }),
    color: z.string({ error: MESSAGES.lines }).max(64, { error: MESSAGES.lines }),
    quantity: z.number({ error: MESSAGES.lines }).int({ error: MESSAGES.lines }).min(1, { error: MESSAGES.lines }).max(MAX_LINE_QTY, { error: MESSAGES.lines }),
  },
  { error: MESSAGES.lines },
)

export const linesSchema = z
  .array(lineSchema, { error: MESSAGES.lines })
  .min(1, { error: MESSAGES.lines })
  .max(MAX_ORDER_LINES, { error: MESSAGES.lines })

export const orderInputSchema = z.object(
  {
    customer: z.object(
      {
        name: nameField,
        phone: phoneField,
        email,
        province: boundedText(1, 100, MESSAGES.province),
        address: boundedText(5, 200, MESSAGES.address),
        note,
      },
      { error: MESSAGES.lines },
    ),
    payment: z.enum(['cod', 'bank'], { error: MESSAGES.lines }),
    lines: linesSchema,
    couponCode: couponCodeSchema,
  },
  { error: MESSAGES.lines },
) as unknown as z.ZodType<OrderInput>
