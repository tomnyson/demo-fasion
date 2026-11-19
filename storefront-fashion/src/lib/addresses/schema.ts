import { z } from 'zod'
import { PROVINCES } from '@/config/provinces'
import { boundedText, CONTACT_MESSAGES, nameField, phoneField } from '@/lib/validation/contact'

export const ADDRESS_MESSAGES = {
  recipient: CONTACT_MESSAGES.name,
  phone: CONTACT_MESSAGES.phone,
  province: 'Vui lòng chọn tỉnh/thành.',
  address: 'Vui lòng nhập địa chỉ (5–200 ký tự).',
  form: 'Dữ liệu không hợp lệ.',
} as const

/** What a customer can edit; owner, default flag and timestamps are set by the server only. */
export const addressInputSchema = z.object(
  {
    recipient: nameField,
    phone: phoneField,
    province: z.enum(PROVINCES, { error: ADDRESS_MESSAGES.province }),
    address: boundedText(5, 200, ADDRESS_MESSAGES.address),
  },
  { error: ADDRESS_MESSAGES.form },
)

export type AddressInput = z.output<typeof addressInputSchema>

export interface Address extends AddressInput {
  readonly id: string
  readonly userId: string
  readonly isDefault: boolean
  readonly createdAt: string
}
