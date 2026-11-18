import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('links the hotline and the policy page', () => {
    render(<TopBar />)
    expect(screen.getByRole('link', { name: /0900 000 000/ }).getAttribute('href')).toBe('tel:0900000000')
    expect(screen.getByRole('link', { name: 'Điều khoản – Chính sách' })).toHaveProperty('pathname', '/chinh-sach')
  })

  it('reads Hỗ trợ khách hàng before the number', () => {
    render(<TopBar />)
    expect(screen.getByText(/Hỗ trợ khách hàng:/)).toBeTruthy()
  })
})
