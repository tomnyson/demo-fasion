import { beforeEach, describe, expect, it } from 'vitest'
import { A, line, valid } from './fixtures'
import type { OrderRepository } from './repository'
import type { Order } from './schema'
import { placeOrder, toPublicOrder } from './service'

let saved: Order[]
let used: number
let deps: { repo: OrderRepository; now: () => Date }

beforeEach(() => {
  saved = []
  used = 0
  deps = {
    repo: { create: async (order) => void saved.push(order), findByCode: async () => null, countByCoupon: async () => used },
    now: () => new Date('2026-11-18T03:00:00Z'),
  }
})

describe('placeOrder', () => {
  it('recomputes prices on the server and ignores client amounts', async () => {
    const r = await placeOrder({ ...valid, total: 1, lines: [{ ...line(2), unitPrice: 1 }] }, deps)
    expect(r.ok && [r.order.subtotal, r.order.shipping, r.order.total]).toEqual([458000, 30000, 488000])
    expect(r.ok && r.order.lines[0]).toMatchObject({ unitPrice: 229000, lineTotal: 458000, name: A.name })
    expect(r.ok && r.order.code).toMatch(/^LS-261118-/)
    expect(r.ok && r.order.createdAt).toBe('2026-11-18T03:00:00.000Z')
    expect(r.ok && r.order.customer.phone).toBe('0901234567')
    expect(saved).toHaveLength(1)
  })

  it('rejects any line that does not survive sanitizeLines unchanged', async () => {
    const duplicate = [line(1), line(1)]
    for (const lines of [
      [{ ...line(1), quantity: 0 }],
      [{ ...line(1), quantity: 1000 }],
      [{ ...line(1), quantity: 1.5 }],
      [{ ...line(1), productId: 'GONE' }],
      [{ ...line(1), size: 'XXXL' }],
      [{ ...line(1), color: 'Không có màu này' }],
      duplicate,
    ]) {
      const res = await placeOrder({ ...valid, lines }, deps)
      expect(res.ok).toBe(false)
      expect(!res.ok && res.fields.lines).toBe('Giỏ hàng không hợp lệ.')
    }
  })

  it('reports one message per field keyed by dot path', async () => {
    const e = await placeOrder({ ...valid, customer: { ...valid.customer, phone: '1', name: '' } }, deps)
    expect(!e.ok && e.fields['customer.phone']).toBe('Số điện thoại không hợp lệ.')
    expect(!e.ok && e.fields['customer.name']).toBe('Vui lòng nhập họ tên (2–80 ký tự).')
    const notObject = await placeOrder('nope', deps)
    expect(!notObject.ok && notObject.fields.lines).toBe('Giỏ hàng không hợp lệ.')
  })

  it('stores only valid orders and hides customer data in the public view', async () => {
    await placeOrder({ ...valid, customer: { ...valid.customer, phone: '1' } }, deps)
    expect(saved).toHaveLength(0)
    await placeOrder(valid, deps)
    expect(saved).toHaveLength(1)
    expect('customer' in toPublicOrder(saved[0])).toBe(false)
  })
})

describe('placeOrder with a coupon', () => {
  const totals = (r: Awaited<ReturnType<typeof placeOrder>>) =>
    r.ok ? [r.order.subtotal, r.order.discount, r.order.shipping, r.order.total, r.order.couponCode] : r.fields

  it('applies a percent code and stores the normalised code with the discount', async () => {
    const r = await placeOrder({ ...valid, couponCode: ' lastudio10 ' }, deps)
    expect(totals(r)).toEqual([458000, 45800, 30000, 442200, 'LASTUDIO10'])
  })

  it('removes the shipping fee for FREESHIP', async () => {
    expect(totals(await placeOrder({ ...valid, couponCode: 'FREESHIP' }, deps))).toEqual([458000, 0, 0, 458000, 'FREESHIP'])
  })

  it('stores no coupon fields when no code is sent', async () => {
    const r = await placeOrder({ ...valid, couponCode: '  ' }, deps)
    expect(r.ok && [r.order.couponCode, r.order.discount]).toEqual([undefined, 0])
  })

  it('rejects unusable codes under the couponCode field and stores nothing', async () => {
    const cases: [unknown, string][] = [
      [{ ...valid, couponCode: 'NOPE' }, 'Mã giảm giá không tồn tại.'],
      [{ ...valid, couponCode: 'THANHVIEN15' }, 'Vui lòng đăng nhập để dùng mã này.'],
      [{ ...valid, couponCode: 'GIAM50K' }, 'Đơn hàng chưa đạt giá trị tối thiểu 500.000 ₫.'],
      [{ ...valid, couponCode: 'X'.repeat(33) }, 'Mã giảm giá không hợp lệ.'],
    ]
    for (const [input, message] of cases) {
      const r = await placeOrder(input, deps)
      expect(!r.ok && r.fields.couponCode).toBe(message)
    }
    used = 100
    const usedUp = await placeOrder({ ...valid, lines: [line(3)], couponCode: 'GIAM50K' }, deps)
    expect(!usedUp.ok && usedUp.fields.couponCode).toBe('Mã giảm giá đã hết lượt sử dụng.')
    expect(saved).toHaveLength(0)
  })
})
