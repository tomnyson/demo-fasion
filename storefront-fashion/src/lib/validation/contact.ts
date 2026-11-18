import { z } from 'zod'

export const CONTACT_MESSAGES = {
  name: 'Vui lòng nhập họ tên (2–80 ký tự).',
  phone: 'Số điện thoại không hợp lệ.',
} as const

const PHONE_PATTERN = /^(0|\+84)\d{9}$/

export const boundedText = (min: number, max: number, message: string) =>
  z.string({ error: message }).trim().min(min, { error: message }).max(max, { error: message })

export const emptyToUndefined = (value: string) => (value === '' ? undefined : value)

export const nameField = boundedText(2, 80, CONTACT_MESSAGES.name)

export const phoneField = z
  .string({ error: CONTACT_MESSAGES.phone })
  .transform((value) => value.replace(/[\s.]/g, ''))
  .pipe(z.string().regex(PHONE_PATTERN, { error: CONTACT_MESSAGES.phone }))
