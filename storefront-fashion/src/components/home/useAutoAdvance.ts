import { useEffect, useRef, useSyncExternalStore } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const query = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION) : null)

function subscribe(onChange: () => void): () => void {
  const mql = query()
  mql?.addEventListener?.('change', onChange)
  return () => mql?.removeEventListener?.('change', onChange)
}

const prefersReducedMotion = () => query()?.matches ?? false

export interface AutoAdvanceOptions {
  readonly count: number
  readonly intervalMs: number
  readonly paused: boolean
  readonly onAdvance: () => void
}

export function useAutoAdvance({ count, intervalMs, paused, onAdvance }: AutoAdvanceOptions): void {
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
  const latest = useRef(onAdvance)
  useEffect(() => {
    latest.current = onAdvance
  })
  const active = count >= 2 && !paused && !reduced
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => latest.current(), intervalMs)
    return () => clearInterval(timer)
  }, [active, intervalMs])
}
