import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MobileContactBar } from './MobileContactBar'

describe('MobileContactBar', () => {
  it('shows the five shortcuts', () => {
    render(<MobileContactBar />)
    for (const label of ['Gọi điện', 'Facebook', 'Chat Zalo', 'Messenger', 'Chỉ đường'])
      expect(screen.getByRole('link', { name: label })).toBeTruthy()
  })

  it('opens external shortcuts safely in a new tab', () => {
    render(<MobileContactBar />)
    for (const label of ['Facebook', 'Chat Zalo', 'Messenger', 'Chỉ đường']) {
      const link = screen.getByRole('link', { name: label })
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })

  it('keeps the phone link in the same tab', () => {
    render(<MobileContactBar />)
    const call = screen.getByRole('link', { name: 'Gọi điện' })
    expect(call.getAttribute('href')).toBe('tel:0900000000')
    expect(call.getAttribute('target')).toBeNull()
  })

  it('is hidden from 850px up', () => {
    render(<MobileContactBar />)
    expect(screen.getByRole('navigation', { name: 'Liên hệ nhanh' }).className).toContain('min-[850px]:hidden')
  })
})
