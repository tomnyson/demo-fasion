import Link from 'next/link'
import type { NavItem } from '@/config/navigation'

export interface MobileNavListProps {
  readonly items: readonly NavItem[]
  readonly onNavigate: () => void
}

export function MobileNavList({ items, onNavigate }: MobileNavListProps) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.href} className="py-1">
          <Link href={item.href} onClick={onNavigate} className="block py-2.5 text-sm font-bold uppercase text-ink">
            {item.label}
          </Link>
          {item.children ? (
            <ul className="mb-2 ml-3 border-l border-line pl-3">
              {item.children.map((child) => (
                <li key={child.href}>
                  <Link href={child.href} onClick={onNavigate} className="block py-2 text-sm text-muted hover:text-brand">
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
