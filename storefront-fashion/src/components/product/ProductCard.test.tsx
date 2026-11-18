import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getProduct, listProducts } from '@/lib/catalog/repository'
import { ProductCard } from './ProductCard'
import { ProductGrid } from './ProductGrid'

const ready = getProduct(listProducts({ categorySlug: 'ao' }).items[0].slug)!

describe('ProductCard', () => {
  it('links to the product page with image and discount badge', () => {
    render(<ProductCard product={ready} />)
    expect(screen.getByRole('link')).toHaveProperty('pathname', `/san-pham/${ready.slug}`)
    expect(screen.getByRole('img', { name: ready.name })).toBeTruthy()
    expect(screen.getByText('-21%').className).toContain('bg-price')
  })

  it('hides the badge when there is no discount', () => {
    render(<ProductCard product={{ ...ready, compareAtPrice: null }} />)
    expect(screen.queryByText(/-\d+%/)).toBeNull()
  })

  it('clamps a very long name to two lines', () => {
    render(<ProductCard product={{ ...ready, name: 'Áo '.repeat(80) }} />)
    expect(screen.getByRole('heading').className).toContain('line-clamp-2')
  })

  it('uses a portrait image box and no colour thumbnails', () => {
    render(<ProductCard product={ready} />)
    expect(screen.getByRole('img', { name: ready.name }).parentElement?.className).toContain('aspect-[3/4]')
    expect(document.querySelectorAll('[data-testid="color-thumb"]').length).toBe(0)
  })
})

describe('ProductGrid', () => {
  it('renders one article per product', () => {
    render(<ProductGrid products={listProducts({ categorySlug: 'vay' }).items.slice(0, 5)} />)
    expect(screen.getAllByRole('article')).toHaveLength(5)
  })
})
