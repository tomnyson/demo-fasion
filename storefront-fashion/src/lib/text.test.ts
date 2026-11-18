import { describe, expect, it } from 'vitest'
import { normalizeText } from '@/lib/text'

describe('normalizeText', () => {
  it('lower-cases, strips diacritics and collapses spaces', () => {
    expect(normalizeText('  Áo Bóng  ĐÁ ')).toBe('ao bong da')
  })

  it('maps đ to d', () => {
    expect(normalizeText('Găng tay đỏ')).toBe('gang tay do')
  })
})
