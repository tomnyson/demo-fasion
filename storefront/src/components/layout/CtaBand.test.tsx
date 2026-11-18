import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CtaBand } from './CtaBand'

describe('CtaBand', () => {
  it('renders the heading, both actions and four ticks', () => {
    render(<CtaBand />)
    expect(screen.getByRole('heading', { name: 'BẠN ĐANG CẦN ĐỒNG PHỤC CHO ĐỘI?' })).toBeTruthy()
    const zalo = screen.getByRole('link', { name: 'NHẮN ZALO NGAY' })
    expect(zalo.getAttribute('href')).toBe('https://zalo.me/0900000000')
    expect(zalo.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByRole('link', { name: 'GỌI 0900 000 000' }).getAttribute('href')).toBe('tel:0900000000')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })
})
