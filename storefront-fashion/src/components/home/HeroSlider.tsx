'use client'

import Image from 'next/image'
import { useState, type FocusEvent, type TouchEvent } from 'react'
import { Button } from '@/components/ui/Button'
import type { Slide } from '@/config/slides'
import { useAutoAdvance } from './useAutoAdvance'

const SWIPE_DISTANCE = 50
const ARROW =
  'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl text-ink shadow-card transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong'
const SLIDE_CONTAINER = 'container-site absolute inset-0 flex items-end pb-14 min-[850px]:pb-16'

function SlideView({ slide, active, first }: { readonly slide: Slide; readonly active: boolean; readonly first: boolean }) {
    return (
    <div
      aria-hidden={!active}
      inert={!active}
      className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
    >
      <Image alt="" fill priority={first} src={slide.imageMobile} sizes="100vw" className="object-cover min-[850px]:hidden" />
      <Image alt="" fill priority={first} src={slide.image} sizes="100vw" className="hidden object-cover min-[850px]:block" />
      <div className={SLIDE_CONTAINER}>
        <div className="max-w-[420px] rounded-card bg-white/90 p-5 text-ink shadow-card">
          <h2 className="text-2xl font-bold leading-tight min-[850px]:text-3xl">{slide.title}</h2>
          <Button variant="primary" href={slide.href} className="mt-4">
            MUA NGAY
          </Button>
        </div>
      </div>
    </div>
  )
}

function Dots({ count, index, onSelect }: { readonly count: number; readonly index: number; readonly onSelect: (i: number) => void }) {
  return (
    <div className="pointer-events-auto flex rounded-full bg-white/90 px-1 shadow-card">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Chuyển tới slide ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
          onClick={() => onSelect(i)}
          className="flex h-9 w-7 items-center justify-center focus-visible:outline-2 focus-visible:outline-brand-strong"
        >
          <span className={`block h-3 w-3 rounded-full border border-brand-strong ${i === index ? 'bg-brand-strong' : 'bg-white'}`} />
        </button>
      ))}
    </div>
  )
}

export function HeroSlider({ slides, intervalMs = 5000 }: { readonly slides: readonly Slide[]; readonly intervalMs?: number }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const count = slides.length
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count)

  useAutoAdvance({ count, intervalMs, paused: hovered || focused, onAdvance: () => go(1) })

  if (count === 0) return null

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
  }
  const onTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const delta = event.changedTouches[0].clientX - (touchStartX ?? event.changedTouches[0].clientX)
    setTouchStartX(null)
    if (Math.abs(delta) >= SWIPE_DISTANCE) go(delta < 0 ? 1 : -1)
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Bộ sưu tập nổi bật"
      className="relative aspect-[4/5] w-full touch-pan-y overflow-hidden bg-soft min-[850px]:aspect-[16/7]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <SlideView key={slide.id} slide={slide} active={i === index} first={i === 0} />
      ))}
      {count > 1 ? (
        <div className="pointer-events-none container-site absolute inset-0">
          <div className="relative h-full">
            <button type="button" aria-label="Slide trước" onClick={() => go(-1)} className={`${ARROW} absolute left-0 top-1/3`}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" aria-label="Slide sau" onClick={() => go(1)} className={`${ARROW} absolute right-0 top-1/3`}>
              <span aria-hidden="true">›</span>
            </button>
            <div className="absolute bottom-3 right-0">
              <Dots count={count} index={index} onSelect={setIndex} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
