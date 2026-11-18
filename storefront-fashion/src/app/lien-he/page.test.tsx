import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ContactPage from './page'

describe('Contact page', () => {
  it('renders one readable button per messaging channel', () => {
    render(<ContactPage />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Nhắn tin cho chúng tôi' })
    const buttons = heading.nextElementSibling?.querySelectorAll('a') ?? []
    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      const classes = button.className.split(/\s+/)
      expect(classes).toContain('bg-brand')
      expect(classes).toContain('text-brand-ink')
      expect(classes).toContain('hover:bg-brand-hover')
      expect(classes).not.toContain('hover:bg-brand-strong')
      expect(classes).not.toContain('text-white')
    }
  })
})
