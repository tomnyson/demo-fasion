export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ProductTag = 'featured' | 'best-seller' | 'new'
export type CollectionSlug = 'noi-bat' | 'best-seller' | 'hang-moi' | 'sale'
export type SortKey = 'popular' | 'newest' | 'price-asc' | 'price-desc'

export interface Category {
  readonly slug: string
  readonly name: string
  readonly image: string
}

export interface Collection {
  readonly slug: CollectionSlug
  readonly name: string
}

export interface ProductColor {
  readonly name: string
  readonly image: string
}

export interface Product {
  readonly id: string
  readonly slug: string
  readonly sku: string
  readonly name: string
  readonly categorySlug: string
  readonly price: number
  readonly compareAtPrice: number | null
  readonly colors: readonly ProductColor[]
  readonly sizes: readonly Size[]
  readonly tags: readonly ProductTag[]
  readonly highlights: readonly string[]
  readonly description: string
  readonly createdAt: string
  readonly popularity: number
}

export interface ProductPage {
  readonly items: readonly Product[]
  readonly total: number
  readonly page: number
  readonly pageCount: number
  readonly from: number
  readonly to: number
}
