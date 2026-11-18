'use client'

import { useEffect, useState } from 'react'
import type { NavItem } from '@/config/navigation'
import { Button } from '@/components/ui/Button'
import { MobileNavList } from './MobileNavList'
import { MobileSearchForm } from './MobileSearchForm'

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
    <div className="xl:hidden">
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
          <button type="button" aria-label="Đóng nền menu" tabIndex={-1} onClick={close} className="absolute inset-0 bg-ink/60" />
          <nav id="mobile-nav" aria-label="Menu chính" className="relative ml-auto h-full w-[min(320px,86vw)] overflow-y-auto bg-white p-5 shadow-card">
            <button type="button" aria-label="Đóng menu" onClick={close} className="mb-3 ml-auto grid h-11 w-11 place-items-center rounded-full hover:bg-soft">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <MobileSearchForm />
            <MobileNavList items={items} onNavigate={close} />
            <Button variant="primary" href="/bao-gia" onClick={close} className="mt-5 w-full">NHẬN BÁO GIÁ</Button>
          </nav>
        </div>
      ) : null}
    </div>
  )
}
