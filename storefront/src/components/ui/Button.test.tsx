import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders a link when href is given', () => {
    render(<Button variant="red" href="/bao-gia">A</Button>)
    expect(screen.getByRole('link', { name: 'A' })).toBeTruthy()
  })

  it('renders a disabled button without href', () => {
    render(<Button variant="blue" disabled>B</Button>)
    expect(screen.getByRole('button', { name: 'B' })).toHaveProperty('disabled', true)
  })

  it('opens external links in a new tab safely', () => {
    render(<Button variant="white" href="https://zalo.me/1">Z</Button>)
    const link = screen.getByRole('link', { name: 'Z' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('keeps tel links in the same tab', () => {
    render(<Button variant="red" href="tel:0900000000">T</Button>)
    expect(screen.getByRole('link', { name: 'T' }).getAttribute('target')).toBeNull()
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button variant="red" onClick={onClick}>C</Button>)
    await userEvent.setup().click(screen.getByRole('button', { name: 'C' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
