'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { sendJson } from '@/lib/http/client'
import { hardNavigate } from '@/lib/navigation/hard-navigate'

interface NavItem {
  readonly href: string
  readonly label: string
  /** Hồ sơ only matches its own URL; the others also cover their sub-pages. */
  readonly exact: boolean
}

export const ACCOUNT_NAV: readonly NavItem[] = [
  { href: '/tai-khoan', label: 'Hồ sơ', exact: true },
  { href: '/tai-khoan/dia-chi', label: 'Địa chỉ', exact: false },
  { href: '/tai-khoan/don-hang', label: 'Đơn hàng', exact: false },
]

const isCurrent = (pathname: string, item: NavItem): boolean =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)

const LINK =
  'block rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong aria-[current=page]:bg-brand aria-[current=page]:text-brand-ink'

function LogoutButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function logout() {
    setPending(true)
    setError(null)
    const response = await sendJson<unknown>('POST', '/api/auth/logout')
    if (response.success) {
      hardNavigate('/')
      return
    }
    setError(response.error.message)
    setPending(false)
  }
  return (
    <>
      <button type="button" onClick={logout} disabled={pending} className={`${LINK} w-full text-left disabled:opacity-50`}>
        {pending ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
      {error === null ? null : (
        <p role="alert" className="px-4 text-sm text-price">
          {error}
        </p>
      )}
    </>
  )
}

/** Account sidebar; wraps into a row of pills on narrow screens. */
export function AccountNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Tài khoản" className="rounded-card border border-line bg-white p-3 shadow-card">
      <ul className="flex flex-wrap gap-1 min-[850px]:flex-col">
        {ACCOUNT_NAV.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={isCurrent(pathname, item) ? 'page' : undefined} className={LINK}>
              {item.label}
            </Link>
          </li>
        ))}
        <li className="min-[850px]:mt-2 min-[850px]:border-t min-[850px]:border-line min-[850px]:pt-2">
          <LogoutButton />
        </li>
      </ul>
    </nav>
  )
}
