import { describe, expect, it } from 'vitest'
import { canCustomerCancel, canTransition, isOrderStatus, ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from './status'

describe('order status', () => {
  it('labels every status in Vietnamese', () => {
    expect(ORDER_STATUSES.map((s) => STATUS_LABELS[s])).toEqual(['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã huỷ'])
  })

  it('allows only the forward flow and cancelling before shipping', () => {
    const allowed: [OrderStatus, OrderStatus][] = [
      ['pending', 'confirmed'],
      ['pending', 'cancelled'],
      ['confirmed', 'shipping'],
      ['confirmed', 'cancelled'],
      ['shipping', 'delivered'],
    ]
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        const expected = allowed.some(([a, b]) => a === from && b === to)
        expect(canTransition(from, to), `${from} → ${to}`).toBe(expected)
      }
    }
  })

  it('lets the customer cancel only a pending order', () => {
    expect(ORDER_STATUSES.filter((status) => canCustomerCancel({ status }))).toEqual(['pending'])
  })

  it('recognises status strings', () => {
    expect(isOrderStatus('shipping')).toBe(true)
    expect(isOrderStatus('lost')).toBe(false)
    expect(isOrderStatus(3)).toBe(false)
  })
})
