import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

const pathname = vi.hoisted(() => ({ value: '/tin-tuc' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }))

describe('Header', () => {
  beforeEach(() => { pathname.value = '/tin-tuc' })

  it('links every main navigation entry and marks the current page', () => {
    render(<Header />)
    for (const label of ['Trang chủ', 'Sản phẩm', 'Sale', 'Tin tức', 'Thời trang', 'Liên hệ']) expect(screen.getByRole('link', { name: label })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Tin tức' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Trang chủ' }).hasAttribute('aria-current')).toBe(false)
    expect(screen.getByRole('link', { name: 'Đầm' })).toHaveProperty('pathname', '/danh-muc/dam')
  })

  it.each([
    ['/', 'Trang chủ'],
    ['/san-pham', 'Sản phẩm'],
    ['/danh-muc/ao', 'Sản phẩm'],
    ['/bo-suu-tap/sale', 'Sale'],
  ])('marks the right item current on %s', (path, label) => {
    pathname.value = path
    render(<Header />)
    const current = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current') === 'page')
    expect(current.map((a) => a.textContent)).toEqual([expect.stringContaining(label)])
  })

  it('keeps Trang chủ from matching deeper pages', () => {
    pathname.value = '/san-pham/ao-so-mi'
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Trang chủ' }).hasAttribute('aria-current')).toBe(false)
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
