// Demo photos stored in public/demo (sources and licences: public/demo/CREDITS.md).
// Replace the files, or the paths below, with the shop's own photos.

const PHOTOS_PER_CATEGORY = 12
const CATEGORY_SLUGS = ['dam', 'vay', 'ao', 'quan'] as const

const demo = (name: string): string => `/demo/${name}.jpg`

const pool = (slug: string): readonly string[] =>
  Object.freeze(Array.from({ length: PHOTOS_PER_CATEGORY }, (_, i) => demo(`${slug}-${i + 1}`)))

const PRODUCT_POOLS: Readonly<Record<string, readonly string[]>> = Object.freeze(
  Object.fromEntries(CATEGORY_SLUGS.map((slug) => [slug, pool(slug)])),
)

export const FALLBACK_IMAGE = demo('slide-2')

export const SLIDE_IMAGES = Object.freeze({
  dresses: Object.freeze({ desktop: demo('slide-1'), mobile: demo('dam-1') }),
  newArrivals: Object.freeze({ desktop: demo('slide-2'), mobile: demo('vay-1') }),
  tops: Object.freeze({ desktop: demo('slide-3'), mobile: demo('ao-1') }),
})

/** Picks a demo photo for one colour of one product, rotating through the category's pool. */
export function productImage(categorySlug: string, productIndex: number, colorIndex: number): string {
  const photos = PRODUCT_POOLS[categorySlug]
  if (!photos) return FALLBACK_IMAGE
  return photos[(productIndex + colorIndex) % photos.length]
}

/** A fixed photo from a category pool, for content such as blog posts. */
export function categoryPhoto(categorySlug: string, number: number): string {
  return productImage(categorySlug, number - 1, 0)
}
