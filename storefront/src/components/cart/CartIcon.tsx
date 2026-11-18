'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export function CartIcon() {
  const { totals } = useCart()
  const count = totals.itemCount
  return (
    <Link
      href="/gio-hang"
      aria-label={`Giỏ hàng, ${count} sản phẩm`}
      className="relative grid h-10 w-10 place-items-center text-ink hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6" />
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
      </svg>
      {count > 0 ? (
        <span aria-hidden="true" className="absolute right-0 top-0 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-white">
          {count}
        </span>
      ) : null}
    </Link>
  )
}
