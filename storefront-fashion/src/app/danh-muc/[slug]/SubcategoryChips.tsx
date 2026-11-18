import Link from 'next/link'
import type { Category } from '@/lib/catalog/types'

export function SubcategoryChips({ categories }: { readonly categories: readonly Category[] }) {
  if (categories.length === 0) return null
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Danh mục con">
      {categories.map((child) => (
        <li key={child.slug}>
          <Link
            href={`/danh-muc/${child.slug}`}
            className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand-strong hover:text-brand-strong"
          >
            {child.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
