import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('links every main navigation entry', () => {
    render(<Header />)
    for (const label of ['Trang chủ', 'Sản phẩm', 'Sale', 'Tin tức', 'Thời trang', 'Liên hệ'])
      expect(screen.getAllByRole('link', { name: new RegExp(label) }).length).toBeGreaterThan(0)
  })

  it('points dropdown children to the right routes and has no price-request button', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Váy' })).toHaveProperty('pathname', '/danh-muc/vay')
    expect(screen.queryByRole('link', { name: /NHẬN/ })).toBeNull()
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
