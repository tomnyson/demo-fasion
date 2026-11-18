import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getProduct, listProducts } from '@/lib/catalog/repository'
import { ProductCard } from './ProductCard'
import { ProductGrid } from './ProductGrid'

const ready = getProduct(listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).items[0].slug)!

describe('ProductCard', () => {
  it('links to the product page with image, discount badge and colour thumbnails', () => {
    render(<ProductCard product={ready} />)
    expect(screen.getByRole('link')).toHaveProperty('pathname', `/san-pham/${ready.slug}`)
    expect(screen.getByRole('img', { name: ready.name })).toBeTruthy()
    expect(screen.getByText('-7%')).toBeTruthy()
    expect(document.querySelectorAll('[data-testid="color-thumb"]').length).toBe(6)
  })

  it('hides the badge when there is no discount', () => {
    render(<ProductCard product={{ ...ready, compareAtPrice: null }} />)
    expect(screen.queryByText(/-\d+%/)).toBeNull()
  })

  it('clamps a very long name to two lines', () => {
    render(<ProductCard product={{ ...ready, name: 'Áo '.repeat(80) }} />)
    expect(screen.getByRole('heading').className).toContain('line-clamp-2')
  })

  it('shows at most six colour thumbnails', () => {
    const colors = Array.from({ length: 9 }, (_, i) => ({ name: `c${i}`, image: `https://picsum.photos/seed/c${i}/800/800` }))
    render(<ProductCard product={{ ...ready, colors }} />)
    expect(document.querySelectorAll('[data-testid="color-thumb"]').length).toBe(6)
    cleanup()
    render(<ProductCard product={{ ...ready, colors: [] }} />)
    expect(document.querySelectorAll('[data-testid="color-thumb"]').length).toBe(0)
  })
})

describe('ProductGrid', () => {
  it('renders one article per product', () => {
    render(<ProductGrid products={listProducts({ categorySlug: 'ao-cau-long' }).items} />)
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })
})
