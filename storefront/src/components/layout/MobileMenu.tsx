'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { NavItem } from '@/config/navigation'

export function MobileMenu({ items }: { readonly items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Mở menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-soft"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <button type="button" aria-label="Đóng nền menu" tabIndex={-1} onClick={close} className="absolute inset-0 bg-navy/60" />
          <nav id="mobile-nav" aria-label="Menu chính" className="relative ml-auto h-full w-[min(320px,86vw)] overflow-y-auto bg-white p-5 shadow-card">
            <button type="button" aria-label="Đóng menu" onClick={close} className="mb-3 ml-auto grid h-11 w-11 place-items-center rounded-full hover:bg-soft">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <form action="/tim-kiem" method="get" role="search" className="mb-3 flex items-center rounded-full border border-line bg-soft">
              <input type="search" name="q" placeholder="Tìm sản phẩm" aria-label="Tìm sản phẩm" className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none" />
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-brand">Tìm</button>
            </form>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.href} className="py-1">
                  <Link href={item.href} onClick={close} className="block py-2.5 text-sm font-bold uppercase text-ink">
                    {item.label}
                  </Link>
                  {item.children ? (
                    <ul className="mb-2 ml-3 border-l border-line pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} onClick={close} className="block py-2 text-sm text-muted hover:text-brand">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
