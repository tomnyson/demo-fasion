import { describe, expect, it } from 'vitest'
import { line } from '@/lib/orders/fixtures'
import { previewCoupon } from './preview'

const deps = { countByCoupon: async () => 0, now: () => new Date('2026-11-19T03:00:00Z') }

describe('previewCoupon', () => {
  it('prices the cart with the code', async () => {
    expect(await previewCoupon({ code: 'lastudio10', lines: [line(2)] }, deps)).toEqual({
      ok: true,
      preview: { code: 'LASTUDIO10', label: 'Giảm 10%, tối đa 50.000đ cho đơn từ 300.000đ', discount: 45800, shipping: 30000, total: 442200 },
    })
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
