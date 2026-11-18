import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '@/lib/catalog/products'
import { getPosts } from '@/lib/content/posts'
import { SLIDES } from '@/config/slides'
import { FALLBACK_IMAGE, SLIDE_IMAGES, categoryPhoto, productImage } from './demo-images'

const onDisk = (path: string): boolean => existsSync(join(process.cwd(), 'public', path))
const LOCAL = /^\/demo\/[a-z0-9-]+\.jpg$/

describe('demo images', () => {
  it('points every slide image at a local file that exists', () => {
    const paths = [FALLBACK_IMAGE, ...Object.values(SLIDE_IMAGES).flatMap((s) => [s.desktop, s.mobile])]
    for (const path of [...paths, ...SLIDES.flatMap((s) => [s.image, s.imageMobile])]) {
      expect(path).toMatch(LOCAL)
      expect(onDisk(path), path).toBe(true)
    }
  })

  it('gives every product colour a local photo that exists', () => {
    const missing = PRODUCTS.flatMap((p) => p.colors.map((c) => c.image)).filter((path) => !LOCAL.test(path) || !onDisk(path))
    expect(missing).toEqual([])
  })

  it('gives every post a local photo that exists', () => {
    const missing = getPosts().map((p) => p.image).filter((path) => !LOCAL.test(path) || !onDisk(path))
    expect(missing).toEqual([])
  })

  it('gives every product in a category its own cover photo', () => {
    for (const slug of ['dam', 'vay', 'ao', 'quan']) {
      const covers = PRODUCTS.filter((p) => p.categorySlug === slug).map((p) => p.colors[0].image)
      expect(covers, slug).toHaveLength(12)
      expect(new Set(covers).size, slug).toBe(12)
    }
  })

  it('never shows the same cover in two different categories', () => {
    const covers = PRODUCTS.map((p) => p.colors[0].image)
    expect(new Set(covers).size).toBe(PRODUCTS.length)
  })

  it('rotates by product and colour, and falls back for an unknown category', () => {
    expect(productImage('vay', 0, 1)).toBe(productImage('vay', 1, 0))
    expect(productImage('vay', 0, 12)).toBe(productImage('vay', 0, 0))
    expect(categoryPhoto('ao', 3)).toBe('/demo/ao-3.jpg')
    expect(productImage('khong-co', 0, 0)).toBe(FALLBACK_IMAGE)
  })
})
