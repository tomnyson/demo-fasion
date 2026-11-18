import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionHead } from './SectionHead'

describe('SectionHead', () => {
  it('renders kicker, title and subtitle centred by default', () => {
    const { container } = render(<SectionHead kicker="K" title="T" subtitle="S" />)
    expect(screen.getByText('K')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'T' })).toBeTruthy()
    expect(screen.getByText('S')).toBeTruthy()
    expect((container.firstChild as HTMLElement).className).toContain('text-center')
  })

  it('omits optional parts and supports left alignment', () => {
    const { container } = render(<SectionHead title="Only" align="left" />)
    expect(container.querySelectorAll('p')).toHaveLength(0)
    expect((container.firstChild as HTMLElement).className).toContain('text-left')
  })
})
