'use client'

import Image from 'next/image'
import type { ProductColor } from '@/lib/catalog/types'

export interface GalleryProps {
  readonly name: string
  readonly colors: readonly ProductColor[]
  readonly activeIndex: number
  readonly onSelect: (index: number) => void
}

export function Gallery({ name, colors, activeIndex, onSelect }: GalleryProps) {
  const active = colors[activeIndex] ?? colors[0]
  if (active === undefined) return <div className="aspect-square rounded-card bg-soft" />
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card bg-soft">
        <Image src={active.image} alt={`${name} – ${active.name}`} fill priority sizes="(max-width: 849px) 100vw, 560px" className="object-cover" />
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <li key={color.name}>
            <button
              type="button"
              aria-label={`Màu ${color.name}`}
              aria-pressed={index === activeIndex}
              onClick={() => onSelect(index)}
              className={`relative block h-16 w-16 overflow-hidden rounded-product border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${index === activeIndex ? 'border-brand' : 'border-line'}`}
            >
              <Image src={color.image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
