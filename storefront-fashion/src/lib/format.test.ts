import { describe, expect, it } from 'vitest'
import { discountPercent, formatDate, formatVnd } from '@/lib/format'

describe('formatVnd', () => {
  it('formats integers with dot separators and the dong sign', () => {
    expect(formatVnd(139000)).toBe('139.000 ₫')
    expect(formatVnd(0)).toBe('0 ₫')
    expect(formatVnd(1290000)).toBe('1.290.000 ₫')
  })
})

describe('discountPercent', () => {
  it('returns the rounded percentage when cheaper than compare-at', () => {
    expect(discountPercent(129000, 139000)).toBe(7)
    expect(discountPercent(169000, 189000)).toBe(11)
  })

  it('returns null when there is no discount', () => {
    expect(discountPercent(139000, null)).toBeNull()
    expect(discountPercent(139000, 139000)).toBeNull() // no badge when not cheaper
    expect(discountPercent(150000, 139000)).toBeNull()
  })
})

describe('formatDate', () => {
  it('renders an ISO date as dd/mm/yyyy', () => {
    expect(formatDate('2026-11-03')).toBe('03/11/2026')
  })
})

describe('shop-time formatting', () => {
  it('shows timestamps in Vietnam time', async () => {
    const { formatDateTime, formatDay } = await import('./format')
    expect(formatDateTime('2026-11-18T03:05:00Z')).toBe('10:05 18/11/2026')
    expect(formatDay('2026-11-18T20:00:00Z')).toBe('19/11/2026')
  })
})
