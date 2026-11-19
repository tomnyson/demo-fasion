import { describe, expect, it, vi } from 'vitest'
import { line } from '@/lib/orders/fixtures'
import { previewCoupon } from './preview'

const usage = vi.fn(async () => ({ total: 0, byUser: 0 }))
const deps = { couponUsage: usage, now: () => new Date('2026-11-19T03:00:00Z') }

describe('previewCoupon', () => {
  it('prices the cart with the code', async () => {
    expect(await previewCoupon({ code: 'lastudio10', lines: [line(2)] }, deps)).toEqual({
      ok: true,
      preview: { code: 'LASTUDIO10', label: 'Giảm 10%, tối đa 50.000đ cho đơn từ 300.000đ', discount: 45800, shipping: 30000, total: 442200 },
    })
  })

  it('counts the signed-in customer’s own uses for member codes', async () => {
    usage.mockResolvedValueOnce({ total: 3, byUser: 1 })
    const r = await previewCoupon({ code: 'THANHVIEN15', lines: [line(2)] }, { ...deps, userId: 'u1' })
    expect(r).toEqual({ ok: false, message: 'Bạn đã dùng hết lượt cho mã giảm giá này.' })
    expect(usage).toHaveBeenLastCalledWith('THANHVIEN15', 'u1')
    expect(await previewCoupon({ code: 'THANHVIEN15', lines: [line(2)] }, { ...deps, userId: 'u1' })).toMatchObject({ ok: true })
  })

  it('explains why a code cannot be used', async () => {
    expect(await previewCoupon({ code: 'nope', lines: [line(1)] }, deps)).toEqual({ ok: false, message: 'Mã giảm giá không tồn tại.' })
    expect(await previewCoupon({ code: '', lines: [line(1)] }, deps)).toEqual({ ok: false, message: 'Vui lòng nhập mã giảm giá.' })
    expect(await previewCoupon({ code: 'X'.repeat(40), lines: [line(1)] }, deps)).toEqual({ ok: false, message: 'Mã giảm giá không hợp lệ.' })
  })

  it('rejects a missing or unknown cart', async () => {
    expect(await previewCoupon({ code: 'FREESHIP', lines: [] }, deps)).toEqual({ ok: false, message: 'Giỏ hàng không hợp lệ.' })
    expect(await previewCoupon({ code: 'FREESHIP', lines: [{ ...line(1), productId: 'GONE' }] }, deps)).toEqual({
      ok: false,
      message: 'Giỏ hàng không hợp lệ.',
    })
    expect(await previewCoupon('nope', deps)).toEqual({ ok: false, message: 'Giỏ hàng không hợp lệ.' })
  })
})
