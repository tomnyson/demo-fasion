import { z } from 'zod'
import { emptyToUndefined, nameField, phoneField } from '@/lib/validation/contact'

export const PASSWORD_MIN = 8
/** scrypt accepts any length; 72 keeps parity with common limits and bounds hashing work. */
export const PASSWORD_MAX = 72

export const AUTH_MESSAGES = {
  email: 'Email không hợp lệ.',
  password: `Mật khẩu cần từ ${PASSWORD_MIN} đến ${PASSWORD_MAX} ký tự.`,
  passwordRequired: 'Vui lòng nhập mật khẩu.',
  form: 'Dữ liệu không hợp lệ.',
} as const

const emailField = z
  .string({ error: AUTH_MESSAGES.email })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: AUTH_MESSAGES.email }).max(254, { error: AUTH_MESSAGES.email }))

const newPasswordField = z
  .string({ error: AUTH_MESSAGES.password })
  .min(PASSWORD_MIN, { error: AUTH_MESSAGES.password })
  .max(PASSWORD_MAX, { error: AUTH_MESSAGES.password })

const existingPasswordField = z
  .string({ error: AUTH_MESSAGES.passwordRequired })
  .min(1, { error: AUTH_MESSAGES.passwordRequired })
  .max(PASSWORD_MAX, { error: AUTH_MESSAGES.passwordRequired })

const optionalPhone = z
  .string({ error: 'Số điện thoại không hợp lệ.' })
  .trim()
  .transform(emptyToUndefined)
  .pipe(phoneField.optional())
  .optional()

const objectOf = <S extends z.ZodRawShape>(shape: S) => z.object(shape, { error: AUTH_MESSAGES.form })

export const registerSchema = objectOf({ name: nameField, email: emailField, phone: optionalPhone, password: newPasswordField })
export const loginSchema = objectOf({ email: emailField, password: existingPasswordField })
export const profileSchema = objectOf({ name: nameField, phone: optionalPhone })
export const passwordChangeSchema = objectOf({ currentPassword: existingPasswordField, newPassword: newPasswordField })

export type RegisterInput = z.output<typeof registerSchema>
export type LoginInput = z.output<typeof loginSchema>
export type ProfileInput = z.output<typeof profileSchema>
export type PasswordChangeInput = z.output<typeof passwordChangeSchema>
