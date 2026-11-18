import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CollectionBlock } from './CollectionBlock'

describe('CollectionBlock', () => {
  it('shows the collection name, eight products and a link to the collection', () => {
    render(<CollectionBlock slug="best-seller" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Best seller' })).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(8)
    expect(screen.getByRole('link', { name: 'XEM THÊM' })).toHaveProperty('pathname', '/bo-suu-tap/best-seller')
  })

  it('renders the heading upper-case through CSS', () => {
    render(<CollectionBlock slug="hang-moi" />)
    expect(screen.getByRole('heading', { level: 2 }).className).toContain('uppercase')
  })
})
