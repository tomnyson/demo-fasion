import { z } from 'zod'
import { MAX_LINE_QTY } from '@/config/commerce'
import { MAX_COUPON_CODE_LENGTH } from '@/config/coupons'
import type { CartLine } from '@/lib/cart/types'
import { boundedText, CONTACT_MESSAGES, emptyToUndefined, nameField, phoneField } from '@/lib/validation/contact'
import type { OrderStatus, StatusChange } from './status'

export interface OrderCustomer {
  name: string
  phone: string
  email?: string
  province: string
  address: string
  note?: string
}

interface OrderInputCommon {
  payment: 'cod' | 'bank'
  lines: CartLine[]
  couponCode?: string
  /** Signed-in customers typing a new address can ask to keep it in their book. */
  saveAddress?: boolean
}

/** Guest checkout, or a signed-in customer typing an address. */
export interface NewAddressOrderInput extends OrderInputCommon {
  customer: OrderCustomer
  addressId?: undefined
}

/** A signed-in customer shipping to a saved address; only email and note come from the form. */
export interface SavedAddressOrderInput extends OrderInputCommon {
  addressId: string
  customer?: Pick<OrderCustomer, 'email' | 'note'>
}

export type OrderInput = NewAddressOrderInput | SavedAddressOrderInput

export interface Order {
  /** Same as `code`; the collection key. Legacy lines get it from `normalizeOrder`. */
  readonly id: string
  readonly code: string
  /** Owner when placed while signed in; guest orders never get one (A8). */
  readonly userId?: string
  /** Legacy lines default to `pending`. */
  readonly status: OrderStatus
  /** Oldest first; legacy lines get a single `pending` entry at `createdAt`. */
  readonly statusHistory: readonly StatusChange[]
  readonly createdAt: string
  readonly customer: OrderCustomer
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

/** What the public success page may show: no customer data and no owner id. */
export type PublicOrder = Omit<Order, 'customer' | 'userId'>

export const MESSAGES = {
  name: CONTACT_MESSAGES.name,
  phone: CONTACT_MESSAGES.phone,
  email: 'Email không hợp lệ.',
  province: 'Vui lòng chọn tỉnh/thành.',
  address: 'Vui lòng nhập địa chỉ (5–200 ký tự).',
  note: 'Ghi chú tối đa 500 ký tự.',
  lines: 'Giỏ hàng không hợp lệ.',
  couponCode: 'Mã giảm giá không hợp lệ.',
  addressId: 'Địa chỉ giao hàng không hợp lệ.',
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

const customerSchema = z.object(
  {
    name: nameField,
    phone: phoneField,
    email,
    province: boundedText(1, 100, MESSAGES.province),
    address: boundedText(5, 200, MESSAGES.address),
    note,
  },
  { error: MESSAGES.lines },
)

const common = {
  payment: z.enum(['cod', 'bank'], { error: MESSAGES.lines }),
  lines: linesSchema,
  couponCode: couponCodeSchema,
  saveAddress: z.boolean({ error: MESSAGES.lines }).optional(),
}

/** Orders that carry the full recipient (guests, or a signed-in customer typing a new address). */
export const orderInputSchema = z.object({ customer: customerSchema, ...common }, { error: MESSAGES.lines }) as unknown as z.ZodType<NewAddressOrderInput>

/** Orders shipped to a saved address; the server fills the recipient from the customer's own book. */
export const savedAddressOrderSchema = z.object(
  {
    addressId: z.string({ error: MESSAGES.addressId }).trim().min(1, { error: MESSAGES.addressId }).max(64, { error: MESSAGES.addressId }),
    customer: z.object({ email, note }, { error: MESSAGES.lines }).optional(),
    ...common,
  },
  { error: MESSAGES.lines },
) as unknown as z.ZodType<SavedAddressOrderInput>

const mentionsAddressId = (input: unknown): boolean => {
  if (typeof input !== 'object' || input === null) return false
  const value = (input as { addressId?: unknown }).addressId
  return value !== undefined && value !== null && value !== ''
}

/** Picks the saved-address schema when the payload names an `addressId`, the full-recipient one otherwise. */
export function parseOrderInput(input: unknown): z.ZodSafeParseResult<OrderInput> {
  return mentionsAddressId(input) ? savedAddressOrderSchema.safeParse(input) : orderInputSchema.safeParse(input)
}
