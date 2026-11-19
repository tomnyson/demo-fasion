import Link from 'next/link'
import type { ReactNode } from 'react'
import { AccountLink } from '@/components/account/AccountLink'
import { MAIN_NAV } from '@/config/navigation'
import { SITE } from '@/config/site'
import { DesktopNav } from './DesktopNav'
import { MobileMenu } from './MobileMenu'

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
        <DesktopNav items={MAIN_NAV} />
        <div className="flex items-center gap-1.5 min-[480px]:gap-3">
          <SearchForm />
          <AccountLink />
          {cartSlot}
          <MobileMenu items={MAIN_NAV} />
        </div>
      </div>
    </header>
  )
}
