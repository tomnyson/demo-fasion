import Link from 'next/link'

export interface BreadcrumbItem {
  readonly label: string
  readonly href?: string
}

export function Breadcrumb({ items }: { readonly items: readonly BreadcrumbItem[] }) {
  const lastIndex = items.length - 1
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex items-center gap-2">
            {index === lastIndex || item.href === undefined ? (
              <span aria-current={index === lastIndex ? 'page' : undefined} className="font-semibold text-ink">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-brand-strong">
                {item.label}
              </Link>
            )}
            {index < lastIndex ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
