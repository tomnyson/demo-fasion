import type { Category } from './types'

const make = (slug: string, name: string): Category =>
  Object.freeze({ slug, name })

export const CATEGORIES: readonly Category[] = Object.freeze([
  make('dam', 'Đầm'),
  make('vay', 'Váy'),
  make('ao', 'Áo'),
  make('quan', 'Quần'),
])
