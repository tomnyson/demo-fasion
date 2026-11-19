import { describe, expect, it } from 'vitest'
import { PROVINCES } from '@/config/provinces'
import { parseInput } from '@/lib/validation/parse'
import { ADDRESS_MESSAGES, addressInputSchema } from './schema'

const valid = { recipient: '  Lan Anh ', phone: '090 123.4567', province: 'Hà Nội', address: ' 12 Phố Huế ' }

describe('addressInputSchema', () => {
  it('trims and normalises a valid address', () => {
    expect(parseInput(addressInputSchema, valid)).toEqual({
      ok: true,
      data: { recipient: 'Lan Anh', phone: '0901234567', province: 'Hà Nội', address: '12 Phố Huế' },
    })
  })

  it('accepts every configured province and nothing else', () => {
    for (const province of PROVINCES) expect(addressInputSchema.safeParse({ ...valid, province }).success).toBe(true)
    expect(parseInput(addressInputSchema, { ...valid, province: 'Paris' })).toEqual({ ok: false, fields: { province: ADDRESS_MESSAGES.province } })
  })

  it('reports field errors in Vietnamese', () => {
    const result = parseInput(addressInputSchema, { recipient: 'A', phone: '123', province: '', address: 'ab' })
    expect(result).toEqual({
      ok: false,
      fields: {
        recipient: 'Vui lòng nhập họ tên (2–80 ký tự).',
        phone: 'Số điện thoại không hợp lệ.',
        province: 'Vui lòng chọn tỉnh/thành.',
        address: 'Vui lòng nhập địa chỉ (5–200 ký tự).',
      },
    })
    expect(parseInput(addressInputSchema, null)).toEqual({ ok: false, fields: { form: 'Dữ liệu không hợp lệ.' } })
  })

  it('drops unknown keys such as userId or isDefault', () => {
    const result = parseInput(addressInputSchema, { ...valid, userId: 'other', isDefault: true })
    expect(result.ok && result.data).not.toHaveProperty('userId')
  })
})
