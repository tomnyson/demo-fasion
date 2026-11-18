import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'

describe('Home page', () => {
  it('renders only the product blocks, without a <main> of its own', () => {
    const { container } = render(<Home />)
    expect(container.querySelectorAll('#san-pham article')).toHaveLength(16)
    expect(container.querySelectorAll('article')).toHaveLength(16)
    expect(container.querySelector('main')).toBeNull()
  })
})
