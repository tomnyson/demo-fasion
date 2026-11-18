import { getCategory, getTopCategories } from '@/lib/catalog/repository'

const ACCESSORIES_SLUG = 'phu-kien'

export interface SportOption {
  readonly slug: string
  readonly name: string
}

/** Quote sports are the top-level categories except accessories. */
export function getSportOptions(): readonly SportOption[] {
  return getTopCategories()
    .filter((category) => category.slug !== ACCESSORIES_SLUG)
    .map(({ slug, name }) => ({ slug, name }))
}

/** Walks parentSlug up to the top-level category; undefined when it is not a sport. */
export function sportForCategory(categorySlug: string): string | undefined {
  let current = getCategory(categorySlug)
  while (current?.parentSlug) current = getCategory(current.parentSlug)
  return current !== null && getSportOptions().some((sport) => sport.slug === current.slug) ? current.slug : undefined
}
