import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders a link when href is given', () => {
    render(<Button variant="primary" href="/gio-hang">A</Button>)
    expect(screen.getByRole('link', { name: 'A' })).toBeTruthy()
  })

  it('renders a disabled button without href', () => {
    render(<Button variant="soft" disabled>B</Button>)
    expect(screen.getByRole('button', { name: 'B' })).toHaveProperty('disabled', true)
  })

  it('opens external links in a new tab safely', () => {
    render(<Button variant="outline" href="https://zalo.me/1">Z</Button>)
    const link = screen.getByRole('link', { name: 'Z' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('keeps tel links in the same tab', () => {
    render(<Button variant="primary" href="tel:0900000000">T</Button>)
    expect(screen.getByRole('link', { name: 'T' }).getAttribute('target')).toBeNull()
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button variant="primary" onClick={onClick}>C</Button>)
    await userEvent.setup().click(screen.getByRole('button', { name: 'C' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it.each([
    ['internal', '/gio-hang'],
    ['external', 'https://zalo.me/1'],
    ['tel', 'tel:0900000000'],
  ])('fires onClick on %s links', async (_kind, href) => {
    const onClick = vi.fn()
    render(<Button variant="primary" href={href} onClick={onClick}>L</Button>)
    const stopNavigation = (event: Event) => event.preventDefault()
    document.addEventListener('click', stopNavigation)
    await userEvent.setup().click(screen.getByRole('link', { name: 'L' }))
    document.removeEventListener('click', stopNavigation)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('styles primary as white on brand-strong', () => {
    render(<Button variant="primary">A</Button>)
    expect(screen.getByRole('button', { name: 'A' }).className).toContain('bg-brand-strong')
  })

  it('styles soft as brand-ink on brand', () => {
    render(<Button variant="soft">B</Button>)
    expect(screen.getByRole('button', { name: 'B' }).className).toMatch(/bg-brand\b.*text-brand-ink|text-brand-ink.*bg-brand\b/)
  })
})
