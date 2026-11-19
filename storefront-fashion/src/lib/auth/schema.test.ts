import { describe, expect, it } from 'vitest'
import { parseInput } from '@/lib/validation/parse'
import { AUTH_MESSAGES, loginSchema, passwordChangeSchema, profileSchema, registerSchema } from './schema'

const register = { name: ' Lan Anh ', email: ' Lan@Example.COM ', phone: '0901 234 567', password: '12345678' }

describe('auth schemas', () => {
  it('normalises a registration: trims, lowercases the email, strips phone spaces', () => {
    expect(parseInput(registerSchema, register)).toEqual({
      ok: true,
      data: { name: 'Lan Anh', email: 'lan@example.com', phone: '0901234567', password: '12345678' },
    })
  })

  it('treats a blank or missing phone as absent', () => {
    const blank = parseInput(registerSchema, { ...register, phone: '  ' })
    expect(blank.ok && blank.data.phone).toBeUndefined()
    const missing = parseInput(registerSchema, { name: 'Lan', email: 'a@b.vn', password: '12345678' })
    expect(missing.ok).toBe(true)
  })

  it.each([
    ['short', '1234567'],
    ['long', 'x'.repeat(73)],
  ])('rejects a %s password', (_name, password) => {
    expect(parseInput(registerSchema, { ...register, password })).toEqual({ ok: false, fields: { password: AUTH_MESSAGES.password } })
  })

  it('accepts 8 and 72 character passwords', () => {
    expect(parseInput(registerSchema, { ...register, password: 'x'.repeat(72) }).ok).toBe(true)
  })

  it('reports each bad field with its own message', () => {
    const result = parseInput(registerSchema, { name: 'A', email: 'not-mail', phone: '123', password: 1 })
    expect(result).toEqual({
      ok: false,
      fields: {
        name: 'Vui lòng nhập họ tên (2–80 ký tự).',
        email: AUTH_MESSAGES.email,
        phone: 'Số điện thoại không hợp lệ.',
        password: AUTH_MESSAGES.password,
      },
    })
    expect(parseInput(registerSchema, null)).toMatchObject({ ok: false, fields: { form: expect.any(String) } })
  })

  it('login needs an email and a non-empty password', () => {
    expect(parseInput(loginSchema, { email: 'A@B.VN', password: 'x' })).toEqual({ ok: true, data: { email: 'a@b.vn', password: 'x' } })
    expect(parseInput(loginSchema, { email: 'a@b.vn', password: '' })).toEqual({ ok: false, fields: { password: AUTH_MESSAGES.passwordRequired } })
  })

  it('profile accepts name and optional phone', () => {
    expect(parseInput(profileSchema, { name: 'Lan', phone: '' })).toEqual({ ok: true, data: { name: 'Lan', phone: undefined } })
  })

  it('password change checks the new password length only', () => {
    expect(parseInput(passwordChangeSchema, { currentPassword: 'old', newPassword: 'new-password' }).ok).toBe(true)
    expect(parseInput(passwordChangeSchema, { currentPassword: '', newPassword: 'short' })).toEqual({
      ok: false,
      fields: { currentPassword: AUTH_MESSAGES.passwordRequired, newPassword: AUTH_MESSAGES.password },
    })
  })
})
