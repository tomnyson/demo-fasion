import { describe, expect, it } from 'vitest'
import { orderInputSchema } from './schema'
import { valid } from './fixtures'

const withCustomer = (patch: Record<string, unknown>) => ({ ...valid, customer: { ...valid.customer, ...patch } })

describe('orderInputSchema', () => {
  it('accepts a valid order and normalises the phone', () => {
    expect(orderInputSchema.safeParse(valid).success).toBe(true)
    expect(orderInputSchema.parse(valid).customer.phone).toBe('0901234567')
    expect(orderInputSchema.parse(withCustomer({ phone: '090.123.4567' })).customer.phone).toBe('0901234567')
    expect(orderInputSchema.parse(withCustomer({ phone: '+84901234567' })).customer.phone).toBe('+84901234567')
  })

  it('turns an empty email into undefined and validates a real one', () => {
    expect(orderInputSchema.parse(withCustomer({ email: '' })).customer.email).toBeUndefined()
    expect(orderInputSchema.parse(withCustomer({ email: ' a@b.vn ' })).customer.email).toBe('a@b.vn')
    expect(orderInputSchema.safeParse(withCustomer({ email: 'nope' })).success).toBe(false)
  })

  it('rejects bad phones, names, payments, lines and notes', () => {
    for (const phone of ['12345', '090123456', '09012345678', 'abcdefghij'])
      expect(orderInputSchema.safeParse(withCustomer({ phone })).success).toBe(false)
    expect(orderInputSchema.safeParse(withCustomer({ name: ' ' })).success).toBe(false)
    expect(orderInputSchema.safeParse({ ...valid, payment: 'crypto' }).success).toBe(false)
    expect(orderInputSchema.safeParse({ ...valid, lines: [] }).success).toBe(false)
    expect(orderInputSchema.safeParse(withCustomer({ note: 'x'.repeat(501) })).success).toBe(false)
  })

  it('rejects NaN, fractional and out-of-range quantities', () => {
    for (const quantity of [Number.NaN, 1.5, 0, 100, -1, '2'])
      expect(orderInputSchema.safeParse({ ...valid, lines: [{ ...valid.lines[0], quantity }] }).success).toBe(false)
  })

  it('uses the exact Vietnamese messages', () => {
    const r = orderInputSchema.safeParse(withCustomer({ phone: '1', name: 'A', province: '', address: 'abc', email: 'x' }))
    const messages = !r.success ? r.error.issues.map((i) => i.message) : []
    expect(messages).toEqual(
      expect.arrayContaining([
        'Vui lòng nhập họ tên (2–80 ký tự).',
        'Số điện thoại không hợp lệ.',
        'Email không hợp lệ.',
        'Vui lòng chọn tỉnh/thành.',
        'Vui lòng nhập địa chỉ (5–200 ký tự).',
      ]),
    )
  })

  it('strips unknown keys such as client-sent prices', () => {
    const parsed = orderInputSchema.parse({ ...valid, total: 1, lines: [{ ...valid.lines[0], unitPrice: 1 }] })
    expect('total' in parsed).toBe(false)
    expect('unitPrice' in parsed.lines[0]).toBe(false)
  })
})
