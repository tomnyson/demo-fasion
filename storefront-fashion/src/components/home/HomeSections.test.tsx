import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'
import { PromoBanners } from './PromoBanners'

describe('Home page', () => {
  it('renders sections 3-10 in order without article elements outside product blocks', () => {
    const { container } = render(<Home />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('THIẾT KẾ THEO YÊU CẦU')
    const titles = ['CHỌN MÔN THỂ THAO CỦA BẠN', 'ĐƠN GIẢN – NHANH CHÓNG']
    for (const t of titles) expect(screen.getByRole('heading', { name: t })).toBeTruthy()
    expect(container.querySelectorAll('#san-pham article')).toHaveLength(24)
    expect(container.querySelectorAll('article')).toHaveLength(24)
    expect(container.querySelector('main')).toBeNull()
    expect(screen.getByRole('link', { name: 'XEM MẪU ÁO' })).toHaveProperty('hash', '#san-pham')
    const tiles = ['ao-bong-da', 'ao-cau-long', 'ao-pickleball', 'ao-bong-chuyen', 'ao-bong-ro', 'ao-polo']
    for (const slug of tiles) expect(container.querySelector(`a[href="/danh-muc/${slug}"]`)).not.toBeNull()
    expect(container.querySelector('a[href="/danh-muc/phu-kien"]')).toBeNull()
  })

  it('promo banners link to the quote page', () => {
    render(<PromoBanners />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    for (const l of links) expect(l).toHaveProperty('pathname', '/bao-gia')
  })
})
