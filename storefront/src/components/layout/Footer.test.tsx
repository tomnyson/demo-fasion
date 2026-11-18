import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('shows the policy and contact columns', () => {
    render(<Footer />)
    expect(screen.getByText('CHÍNH SÁCH MUA HÀNG')).toBeTruthy()
    expect(screen.getByText('THÔNG TIN LIÊN HỆ')).toBeTruthy()
    expect(screen.getByRole('link', { name: /0900 000 000/ }).getAttribute('href')).toBe('tel:0900000000')
  })

  it('shows the sample-brand copyright and no reference brand', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2026 Vertex Sport/)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/enzo/i)
  })

  it('links the four policy anchors', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Chính sách bảo mật' }).getAttribute('href')).toBe('/chinh-sach#bao-mat')
  })

  it('links to the contact page', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Liên hệ' }).getAttribute('href')).toBe('/lien-he')
  })
})
