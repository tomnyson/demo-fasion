import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '@/lib/catalog/categories'
import { PRODUCTS } from '@/lib/catalog/products'
import { ABOUT_IMAGE, HERO_IMAGE, PROJECT_IMAGES, categoryBanner, productImage } from './demo-images'

const onDisk = (path: string): boolean => existsSync(join(process.cwd(), 'public', path))

describe('demo images', () => {
  it('points every shared image at a file in public/demo', () => {
    for (const path of [HERO_IMAGE, ABOUT_IMAGE, ...Object.values(PROJECT_IMAGES)]) {
      expect(path).toMatch(/^\/demo\/[a-z0-9-]+\.jpg$/)
      expect(onDisk(path), path).toBe(true)
    }
  })

  it('gives every category a banner that exists', () => {
    for (const category of CATEGORIES) {
      expect(category.image).toBe(categoryBanner(category.slug))
      expect(onDisk(category.image), category.slug).toBe(true)
    }
  })

  it('gives every product colour a local photo that exists', () => {
    const missing = PRODUCTS.flatMap((p) => p.colors.map((c) => c.image)).filter((path) => !path.startsWith('/demo/') || !onDisk(path))
    expect(missing).toEqual([])
  })

  it('rotates through the pool by product and colour', () => {
    expect(productImage('ao-polo', 0, 0)).not.toBe(productImage('ao-polo', 0, 1))
    expect(productImage('ao-polo', 0, 3)).toBe(productImage('ao-polo', 0, 0))
    expect(productImage('ao-polo', 1, 0)).toBe(productImage('ao-polo', 0, 1))
  })

  it('falls back to the hero photo for an unknown category', () => {
    expect(categoryBanner('khong-ton-tai')).toBe(HERO_IMAGE)
    expect(productImage('khong-ton-tai', 0, 0)).toBe(HERO_IMAGE)
  })
})
