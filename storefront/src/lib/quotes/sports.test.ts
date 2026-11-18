import { describe, expect, it } from 'vitest'
import { getSportOptions, sportForCategory } from './sports'

describe('sports', () => {
  it('lists the six shirt categories and no accessories', () => {
    const slugs = getSportOptions().map((s) => s.slug)
    expect(slugs).toHaveLength(6)
    expect(slugs).toContain('ao-bong-da')
    expect(slugs).not.toContain('phu-kien')
  })

  it('walks up to the top-level sport', () => {
    expect(sportForCategory('ao-bong-da-thiet-ke')).toBe('ao-bong-da')
    expect(sportForCategory('ao-pickleball')).toBe('ao-pickleball')
  })

  it('has no sport for accessories or unknown categories', () => {
    expect(sportForCategory('giay')).toBeUndefined()
    expect(sportForCategory('phu-kien')).toBeUndefined()
    expect(sportForCategory('khong-co')).toBeUndefined()
  })
})
