import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { ContactPanel } from './ContactPanel'

describe('ContactPanel', () => {
  it('offers phone, Zalo and quote links but no cart', () => {
    const custom = listProducts({ categorySlug: 'ao-cau-long' }).items[0]
    render(<ContactPanel product={custom} />)
    expect(screen.getByRole('link', { name: 'LIÊN HỆ ĐẶT HÀNG' }).getAttribute('href')).toBe('tel:0900000000')
    expect(screen.getByRole('link', { name: 'TƯ VẤN THIẾT KẾ' }).getAttribute('href')).toBe('https://zalo.me/0900000000')
    expect(screen.getByRole('link', { name: 'Nhận báo giá cho mẫu này' }).getAttribute('href')).toBe(`/bao-gia?san-pham=${custom.slug}`)
    expect(screen.queryByRole('button', { name: /GIỎ/ })).toBeNull()
  })
})
