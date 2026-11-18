import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProductBlock } from './ProductBlock'

describe('ProductBlock', () => {
  it('shows four product cards and a link to the category', () => {
    render(<ProductBlock categorySlug="ao-cau-long" subtitle="x" />)
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getByRole('link', { name: /XEM TẤT CẢ/ })).toHaveProperty('pathname', '/danh-muc/ao-cau-long')
  })

  it('renders nothing for an unknown category', () => {
    const { container } = render(<ProductBlock categorySlug="khong-ton-tai" subtitle="x" />)
    expect(container.innerHTML).toBe('')
  })
})
