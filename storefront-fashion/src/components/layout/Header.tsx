import Link from 'next/link'
import type { ReactNode } from 'react'
import { MAIN_NAV } from '@/config/navigation'
import { SITE } from '@/config/site'
import { Button } from '@/components/ui/Button'
import { MobileMenu } from './MobileMenu'

const ITEM = 'block whitespace-nowrap px-1.5 py-2 text-[13px] font-bold uppercase text-ink hover:text-brand-strong focus-visible:text-brand-strong'

function DesktopNav() {
  return (
    <nav aria-label="Danh mục chính" className="hidden xl:block">
      <ul className="flex items-center">
        {MAIN_NAV.map((item) => (
          <li key={item.href} className="group relative">
            <Link href={item.href} className={ITEM}>
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
        ))}
      </ul>
    </nav>
  )
}

function SearchForm() {
  return (
    <form action="/tim-kiem" method="get" role="search" className="hidden items-center rounded-full border border-line bg-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-strong xl:flex">
      <input
        type="search"
        name="q"
        placeholder="Tìm kiếm sản phẩm"
        aria-label="Tìm kiếm sản phẩm"
        className="w-20 text-ellipsis bg-transparent px-3 py-2 text-sm outline-none 2xl:w-44 2xl:px-4"
      />
      <button type="submit" aria-label="Tìm" className="grid h-9 w-9 place-items-center text-ink hover:text-brand-strong">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </button>
    </form>
  )
}

export function Header({ cartSlot }: { readonly cartSlot?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-site flex h-[78px] items-center gap-2">
        <Link href="/" className="mr-auto flex flex-col leading-tight xl:mr-2" aria-label={SITE.name}>
          <span className="whitespace-nowrap text-lg font-black min-[480px]:text-xl 2xl:text-2xl uppercase text-ink">{SITE.name}</span>
          <span className="hidden whitespace-nowrap text-[11px] text-muted 2xl:block">{SITE.tagline}</span>
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-1.5 min-[480px]:gap-3">
          <SearchForm />
          {cartSlot}
          <Button variant="primary" href="/bao-gia" className="px-3 text-xs min-[480px]:px-5 min-[480px]:text-sm">NHẬN BÁO GIÁ</Button>
          <MobileMenu items={MAIN_NAV} />
        </div>
      </div>
    </header>
  )
}
