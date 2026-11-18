import { describe, expect, it } from 'vitest'
import { parseListingParams } from '@/lib/catalog/listing-params'

describe('parseListingParams', () => {
  it('returns defaults for empty input', () => {
    expect(parseListingParams({})).toEqual({ sort: 'newest', page: 1, query: '' })
  })

  it('falls back on invalid sort and page', () => {
    expect(parseListingParams({ sort: 'xyz', page: 'abc' })).toEqual({ sort: 'newest', page: 1, query: '' })
    expect(parseListingParams({ page: '-3' }).page).toBe(1)
    expect(parseListingParams({ page: '2.7' }).page).toBe(1)
  })

  it('uses the first value of array params', () => {
    expect(parseListingParams({ sort: ['price-desc', 'newest'], page: ['2'] })).toMatchObject({ sort: 'price-desc', page: 2 })
  })

  it('trims, collapses and caps the query', () => {
    expect(parseListingParams({ q: '  ao   bong ' }).query).toBe('ao bong')
    expect(parseListingParams({ q: 'x'.repeat(500) }).query).toHaveLength(100)
  })
})
