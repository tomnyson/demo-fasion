'use client'

import Link from 'next/link'
import { useSessionUser } from './useSessionUser'

const ICON_LINK =
  'hidden h-10 w-10 place-items-center text-ink hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong min-[360px]:grid'

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

/** Header icon: "Tài khoản" when signed in, "Đăng nhập" otherwise. */
export function AccountLink() {
  const { signedIn } = useSessionUser()
  return (
    <Link href={signedIn ? '/tai-khoan' : '/dang-nhap'} aria-label={signedIn ? 'Tài khoản' : 'Đăng nhập'} className={ICON_LINK}>
      <PersonIcon />
    </Link>
  )
}

/** Text link for the mobile menu panel. */
export function MobileAccountLink({ onNavigate }: { readonly onNavigate: () => void }) {
  const { signedIn } = useSessionUser()
  return (
    <Link
      href={signedIn ? '/tai-khoan' : '/dang-nhap'}
      onClick={onNavigate}
      className="mt-3 flex items-center gap-2 border-t border-line pt-4 text-sm font-bold uppercase text-ink hover:text-brand-strong"
    >
      <PersonIcon />
      {signedIn ? 'Tài khoản' : 'Đăng nhập'}
    </Link>
  )
}
