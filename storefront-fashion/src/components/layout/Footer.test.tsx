import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('shows the five headings and the copyright strip', () => {
    render(<Footer />)
    for (const h of ['THỜI TRANG NỮ LÁ STUDIO', 'GIỚI THIỆU', 'HỖ TRỢ KHÁCH HÀNG', 'KẾT NỐI', 'PHƯƠNG THỨC THANH TOÁN']) expect(screen.getByText(h)).toBeTruthy()
    expect(screen.getByText(`© ${new Date().getFullYear()} Lá Studio`)).toBeTruthy()
  })

  it('gives the shop details and the opening hours', () => {
    render(<Footer />)
    expect(screen.getByText('8:30 – 21:00 tất cả các ngày trong tuần')).toBeTruthy()
    expect(screen.getByRole('link', { name: /0900 000 000/ }).getAttribute('href')).toBe('tel:0900000000')
    expect(screen.getByRole('link', { name: /hello@/ }).getAttribute('href')).toMatch(/^mailto:/)
  })

  it('links the about and support columns', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Chính sách bảo mật' }).getAttribute('href')).toBe('/chinh-sach#bao-mat')
    expect(screen.getByRole('link', { name: 'Quy định đổi hàng' }).getAttribute('href')).toBe('/chinh-sach#doi-hang')
    expect(screen.getByRole('link', { name: 'Tin thời trang' }).getAttribute('href')).toBe('/thoi-trang')
    expect(screen.getByRole('link', { name: 'Liên hệ' }).getAttribute('href')).toBe('/lien-he')
  })

  it('connects to Facebook, Tiktok and Shopee in new tabs and names the payment methods', () => {
    render(<Footer />)
    for (const name of ['Facebook', 'Tiktok', 'Shopee']) expect(screen.getByRole('link', { name }).getAttribute('target')).toBe('_blank')
    expect(screen.getByText('COD')).toBeTruthy()
    expect(screen.getByText('Chuyển khoản')).toBeTruthy()
  })
})
