'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/config/navigation'

const ITEM = 'block whitespace-nowrap border-b-2 border-transparent px-1.5 py-2 text-[13px] font-bold uppercase text-ink hover:text-brand-strong focus-visible:text-brand-strong'
const CURRENT = 'border-brand-strong text-brand-strong'

function isCurrent(item: NavItem, pathname: string): boolean {
  if (item.href === '/san-pham') return pathname.startsWith('/san-pham') || pathname.startsWith('/danh-muc/')
  return pathname === item.href
}

export function DesktopNav({ items }: { readonly items: readonly NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Danh mục chính" className="hidden xl:block">
      <ul className="flex items-center">
        {items.map((item) => {
          const current = isCurrent(item, pathname)
          return (
            <li key={item.href} className="group relative">
              <Link href={item.href} aria-current={current ? 'page' : undefined} className={`${ITEM} ${current ? CURRENT : ''}`}>
                {item.label}
                {item.children ? <span aria-hidden="true"> ▾</span> : null}
              </Link>
              {item.children ? (
                <ul className="invisible absolute left-0 top-full z-50 min-w-48 rounded-product bg-white py-2 opacity-0 shadow-card transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className="block px-4 py-2 text-sm text-ink hover:bg-soft hover:text-brand-strong">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
