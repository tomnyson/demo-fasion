import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8')

describe('globals.css theme', () => {
  it.each([
    ['brand', '#CFE89A'],
    ['brand-strong', '#3F6B1B'],
    ['brand-ink', '#2F4A12'],
    ['soft', '#F7FBEF'],
    ['line', '#E3EDD3'],
    ['ink', '#1F2A14'],
    ['muted', '#66705A'],
    ['price', '#E5484D'],
    ['card-line', '#E3EDD3'],
  ])('defines --color-%s as %s', (token, hex) => {
    expect(css).toContain(`--color-${token}: ${hex};`)
  })

  it('drops the old navy, accent and hero tokens', () => {
    expect(css).not.toMatch(/--color-(navy|accent)|background-image-hero/)
  })

  it('sets the card, product and contact radii and the card shadow', () => {
    expect(css).toContain('--radius-card: 14px;')
    expect(css).toContain('--radius-product: 14px;')
    expect(css).toContain('--radius-contact: 16px;')
    expect(css).toContain('--shadow-card: 0 10px 30px rgba(47, 74, 18, 0.10);')
  })
})
