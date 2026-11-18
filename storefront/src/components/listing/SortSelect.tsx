'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ChangeEvent } from 'react'
import { SORT_LABELS } from '@/lib/catalog/repository'
import type { SortKey } from '@/lib/catalog/types'

const SORT_KEYS = Object.keys(SORT_LABELS) as readonly SortKey[]

export function SortSelect({ value }: { readonly value: SortKey }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('page')
    next.set('sort', event.target.value)
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <select
      aria-label="Sắp xếp"
      value={value}
      onChange={onChange}
      className="h-11 rounded-full border border-line bg-white px-4 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {SORT_KEYS.map((key) => (
        <option key={key} value={key}>
          {SORT_LABELS[key]}
        </option>
      ))}
    </select>
  )
}
