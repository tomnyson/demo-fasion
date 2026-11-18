import type { Category } from './types'

const make = (slug: string, name: string): Category =>
  Object.freeze({ slug, name, image: `https://picsum.photos/seed/${slug}/800/400` })

export const CATEGORIES: readonly Category[] = Object.freeze([
  make('dam', 'Đầm'),
  make('vay', 'Váy'),
  make('ao', 'Áo'),
  make('quan', 'Quần'),
])
