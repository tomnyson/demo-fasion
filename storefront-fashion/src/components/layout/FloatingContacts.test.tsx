import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FloatingContacts } from './FloatingContacts'

describe('FloatingContacts', () => {
  it('links Zalo, phone and Facebook', () => {
    render(<FloatingContacts />)
    expect(screen.getByRole('link', { name: 'Chat Zalo' }).getAttribute('href')).toBe('https://zalo.me/0900000000')
    expect(screen.getByRole('link', { name: /Gọi điện/ }).getAttribute('href')).toBe('tel:0900000000')
    expect(screen.getByRole('link', { name: 'Facebook' }).getAttribute('href')).toBe('https://facebook.com/')
  })

  it('opens external links safely and keeps tel in the same tab', () => {
    render(<FloatingContacts />)
    for (const name of ['Chat Zalo', 'Facebook']) {
      const link = screen.getByRole('link', { name })
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
    expect(screen.getByRole('link', { name: /Gọi điện/ }).getAttribute('target')).toBeNull()
  })
})
