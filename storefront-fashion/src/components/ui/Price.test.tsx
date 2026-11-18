import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Price } from './Price'

describe('Price', () => {
  it('shows the old price in <del> and the current price in <ins>', () => {
    render(<Price price={129000} compareAtPrice={139000} />)
    expect(document.querySelector('del')?.textContent).toContain('139.000 ₫')
    expect(document.querySelector('ins')?.textContent).toContain('129.000 ₫')
  })

  it('omits <del> and shows the plain price without a prefix', () => {
    render(<Price price={139000} compareAtPrice={null} />)
    expect(document.querySelector('del')).toBeNull()
    expect(screen.queryByText(/Từ/)).toBeNull()
    expect(document.querySelector('ins')?.textContent).toContain('139.000 ₫')
  })

  it('labels both prices for screen readers and supports the detail size', () => {
    render(<Price price={129000} compareAtPrice={139000} size="detail" />)
    expect(screen.getByText('Giá gốc:')).toBeTruthy()
    expect(screen.getByText('Giá hiện tại:')).toBeTruthy()
    cleanup()
    render(<Price price={129000} compareAtPrice={null} />)
    expect(screen.queryByText('Giá gốc:')).toBeNull()
    expect(screen.queryByText(/Từ/)).toBeNull()
  })
})
