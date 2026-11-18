import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('links earlier items and marks the last one as the current page', () => {
    render(<Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Váy' }]} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Trang chủ' }).getAttribute('href')).toBe('/')
    expect(screen.getByText('Váy').getAttribute('aria-current')).toBe('page')
  })
})
