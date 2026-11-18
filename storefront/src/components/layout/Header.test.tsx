import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('links every main navigation entry', () => {
    render(<Header />)
    for (const label of ['Áo bóng đá', 'Áo cầu lông', 'Pickleball', 'Bóng chuyền', 'Bóng rổ', 'Polo', 'Phụ kiện', 'Tin tức'])
      expect(screen.getAllByRole('link', { name: new RegExp(label) }).length).toBeGreaterThan(0)
  })

  it('points dropdown children and the CTA to the right routes', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Không logo' })).toHaveProperty('pathname', '/danh-muc/ao-bong-da-khong-logo')
    expect(screen.getByRole('link', { name: 'NHẬN BÁO GIÁ' })).toHaveProperty('pathname', '/bao-gia')
  })

  it('has a GET search form with field q', () => {
    render(<Header />)
    expect(screen.getByPlaceholderText('Tìm kiếm sản phẩm').getAttribute('name')).toBe('q')
    expect(screen.getByRole('button', { name: 'Tìm' })).toBeTruthy()
  })

  it('renders the cart slot', () => {
    render(<Header cartSlot={<span>cart-here</span>} />)
    expect(screen.getByText('cart-here')).toBeTruthy()
  })
})
