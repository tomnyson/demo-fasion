import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'
import { SLIDES } from '@/config/slides'

describe('Home page', () => {
  it('renders the slider and the three collection blocks, without a <main> of its own', () => {
    render(<Home />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent).slice(-3)).toEqual(['Sản phẩm nổi bật', 'Best seller', 'Hàng mới về'])
    expect(document.querySelectorAll('#san-pham article')).toHaveLength(24)
    expect(document.querySelectorAll('article')).toHaveLength(24)
    expect(document.querySelector('main')).toBeNull()
  })
})

describe('SLIDES', () => {
  it('has three slides pointing at existing routes with picsum images', () => {
    expect(SLIDES).toHaveLength(3)
    for (const slide of SLIDES) {
      expect(slide.href).toMatch(/^\/(danh-muc|bo-suu-tap)\/[a-z-]+$/)
      expect(slide.image).toMatch(/^https:\/\/picsum\.photos\/seed\/[\w-]+\/1600\/700$/)
      expect(slide.imageMobile).toMatch(/^https:\/\/picsum\.photos\/seed\/[\w-]+\/800\/1000$/)
    }
    expect(new Set(SLIDES.map((s) => s.id)).size).toBe(3)
  })
})
