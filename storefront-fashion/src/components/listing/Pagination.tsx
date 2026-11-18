import Link from 'next/link'

export function buildPageItems(page: number, pageCount: number): readonly (number | 'gap')[] {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1])
  const pages = [...wanted].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b)
  return pages.flatMap((n, index) => (index > 0 && n - pages[index - 1] > 1 ? ['gap' as const, n] : [n]))
}

const CELL = 'grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold'

interface PaginationProps {
  readonly page: number
  readonly pageCount: number
  readonly hrefFor: (page: number) => string
}

export function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Phân trang" className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <li>
            <Link href={hrefFor(page - 1)} aria-label="Trang trước" className={`${CELL} border border-line text-ink hover:text-brand-strong`}>
              ‹
            </Link>
          </li>
        ) : null}
        {buildPageItems(page, pageCount).map((item, index) => (
          <li key={item === 'gap' ? `gap-${index}` : item}>
            {item === 'gap' ? (
              <span className={`${CELL} text-muted`}>…</span>
            ) : item === page ? (
              <span aria-current="page" className={`${CELL} bg-brand-strong text-white`}>
                {item}
              </span>
            ) : (
              <Link href={hrefFor(item)} className={`${CELL} border border-line text-ink hover:text-brand-strong`}>
                {item}
              </Link>
            )}
          </li>
        ))}
        {page < pageCount ? (
          <li>
            <Link href={hrefFor(page + 1)} aria-label="Trang sau" className={`${CELL} border border-line text-ink hover:text-brand-strong`}>
              ›
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
