import Link from 'next/link'
import type { ReactNode } from 'react'

export interface ButtonProps {
  readonly variant: 'red' | 'blue' | 'white'
  readonly href?: string
  readonly type?: 'button' | 'submit'
  readonly disabled?: boolean
  readonly onClick?: () => void
  readonly children: ReactNode
  readonly className?: string
}

const VARIANTS = {
  red: 'bg-accent text-white hover:brightness-110',
  blue: 'bg-brand text-white hover:brightness-110',
  white: 'bg-white text-navy hover:bg-soft',
} as const

const BASE =
  'inline-flex h-11 items-center whitespace-nowrap justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50'

const isWebUrl = (href: string) => /^https?:\/\//.test(href)

export function Button({ variant, href, type = 'button', disabled, onClick, children, className = '' }: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`.trim()
  if (href === undefined)
    return (
      <button type={type} disabled={disabled} onClick={onClick} className={classes}>
        {children}
      </button>
    )
  if (isWebUrl(href))
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={classes}>
        {children}
      </a>
    )
  if (href.startsWith('tel:'))
    return (
      <a href={href} onClick={onClick} className={classes}>
        {children}
      </a>
    )
  return (
    <Link href={href} onClick={onClick} className={classes}>
      {children}
    </Link>
  )
}
