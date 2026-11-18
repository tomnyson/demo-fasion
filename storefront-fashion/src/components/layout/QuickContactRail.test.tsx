import { cleanup, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getQuickContacts } from '@/config/contacts'
import { QuickContactRail } from './QuickContactRail'

describe('QuickContactRail', () => {
  it('renders six labelled links with hand-drawn icons', () => {
    render(<QuickContactRail />)
    const nav = screen.getByRole('navigation', { name: 'Liên hệ nhanh' })
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Trang chủ', 'Hotline', 'Zalo', 'Messenger', 'Shopee', 'Tiktok'])
    expect(nav.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(6)
  })

  it('opens external channels in a new tab and keeps the call link in place', () => {
    render(<QuickContactRail />)
    const nav = screen.getByRole('navigation', { name: 'Liên hệ nhanh' })
    expect(within(nav).getByRole('link', { name: 'Hotline' }).getAttribute('href')).toBe('tel:0900000000')
    expect(within(nav).getByRole('link', { name: 'Hotline' }).hasAttribute('target')).toBe(false)
    const shopee = within(nav).getByRole('link', { name: 'Shopee' })
    expect([shopee.getAttribute('target'), shopee.getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer'])
  })

  it('uses the brand colours and never white text', () => {
    render(<QuickContactRail />)
    const nav = screen.getByRole('navigation', { name: 'Liên hệ nhanh' })
    expect(nav.querySelector('a')?.className).toMatch(/bg-brand\b/)
    expect(nav.querySelector('a')?.className).toContain('text-brand-ink')
    expect(nav.innerHTML).not.toContain('text-white')
  })

  it('shows only the contacts it is given, and nothing when there are none', () => {
    render(<QuickContactRail contacts={getQuickContacts({ hotlineTel: 'tel:1', zaloUrl: '', messengerUrl: '', shopeeUrl: '', tiktokUrl: '' })} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    cleanup()
    const { container } = render(<QuickContactRail contacts={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
