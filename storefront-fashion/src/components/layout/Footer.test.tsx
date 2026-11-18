import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('shows the policy and contact columns', () => {
    render(<Footer />)
    expect(screen.getByText('HỖ TRỢ KHÁCH HÀNG')).toBeTruthy()
    expect(screen.getByText('THÔNG TIN LIÊN HỆ')).toBeTruthy()
    expect(screen.getByRole('link', { name: /0900 000 000/ }).getAttribute('href')).toBe('tel:0900000000')
  })

  it('shows the sample-brand copyright and no reference brand', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2026 Lá Studio/)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/enzo/i)
  })

  it('links the about and support columns', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Chính sách bảo mật' }).getAttribute('href')).toBe('/chinh-sach#bao-mat')
    expect(screen.getByRole('link', { name: 'Quy định đổi hàng' }).getAttribute('href')).toBe('/chinh-sach#doi-hang')
    expect(screen.getByRole('link', { name: 'Tin thời trang' }).getAttribute('href')).toBe('/thoi-trang')
  })

  it('links to the contact page', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Liên hệ' }).getAttribute('href')).toBe('/lien-he')
  })
})
