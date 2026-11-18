import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '@/lib/catalog/products'
import { quoteInputSchema } from './schema'

const valid = { name: 'Trần B', phone: '0901234567', sport: 'ao-bong-da', quantity: '12' }
const msg = (v: object) => {
  const r = quoteInputSchema.safeParse({ ...valid, ...v })
  return r.success ? null : r.error.issues[0].message
}

describe('quoteInputSchema', () => {
  it('coerces the quantity from a string and normalises the phone', () => {
    expect(quoteInputSchema.parse(valid).quantity).toBe(12)
    expect(quoteInputSchema.parse({ ...valid, phone: '090.123.4567' }).phone).toBe('0901234567')
  })

  it('enforces the quantity range', () => {
    expect(msg({ quantity: 4 })).toBe('Số lượng tối thiểu là 5 bộ.')
    expect(msg({ quantity: 5 })).toBeNull()
    expect(msg({ quantity: 10000 })).toBeNull()
    for (const q of [10001, 7.5, 'abc', '', -1]) expect(msg({ quantity: q })).not.toBeNull()
  })

  it('only accepts top-level sport categories', () => {
    expect(msg({ sport: 'giay' })).toBe('Vui lòng chọn môn thể thao.')
    expect(msg({ sport: 'khong-co' })).toBe('Vui lòng chọn môn thể thao.')
    expect(msg({ sport: 'phu-kien' })).toBe('Vui lòng chọn môn thể thao.')
    expect(msg({ sport: 'ao-bong-da-khong-logo' })).toBe('Vui lòng chọn môn thể thao.')
    expect(msg({ sport: 'ao-polo' })).toBeNull()
  })

  it('applies the same name and phone rules as orders', () => {
    expect(msg({ name: ' ' })).toBe('Vui lòng nhập họ tên (2–80 ký tự).')
    expect(msg({ phone: '12345' })).toBe('Số điện thoại không hợp lệ.')
  })

  it('limits and normalises the message', () => {
    expect(msg({ message: 'x'.repeat(1001) })).toBe('Nội dung tối đa 1000 ký tự.')
    expect(quoteInputSchema.parse({ ...valid, message: '  ' }).message).toBeUndefined()
    expect(quoteInputSchema.parse({ ...valid, message: ' cần gấp ' }).message).toBe('cần gấp')
  })

  it('drops an unknown or non-string product slug instead of rejecting it', () => {
    expect(quoteInputSchema.parse({ ...valid, productSlug: 'khong-ton-tai' }).productSlug).toBeUndefined()
    expect(quoteInputSchema.parse({ ...valid, productSlug: 42 }).productSlug).toBeUndefined()
  })

  it('keeps a known product slug', () => {
    const slug = PRODUCTS[0].slug
    expect(quoteInputSchema.parse({ ...valid, productSlug: slug }).productSlug).toBe(slug)
  })
})
