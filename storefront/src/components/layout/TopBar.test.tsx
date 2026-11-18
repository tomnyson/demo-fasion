import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('shows the promise line and the hotline', () => {
    render(<TopBar />)
    expect(screen.getByText('Thiết kế miễn phí · Sản xuất nhanh · Giao hàng toàn quốc')).toBeTruthy()
    expect(screen.getByText(/Tư vấn 24\/7/)).toBeTruthy()
    expect(screen.getByRole('link', { name: '0900 000 000' }).getAttribute('href')).toBe('tel:0900000000')
  })
})
