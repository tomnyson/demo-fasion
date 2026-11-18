import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoAdvance } from './useAutoAdvance'

type Listener = () => void

function stubReducedMotion(initial: boolean) {
  const listeners = new Set<Listener>()
  const mql = {
    matches: initial,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  }
  const matchMedia = vi.fn(() => mql)
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    set: (value: boolean) => {
      mql.matches = value
      listeners.forEach((fn) => fn())
    },
  }
}

describe('useAutoAdvance', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubReducedMotion(false)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const run = (opts: Partial<Parameters<typeof useAutoAdvance>[0]> = {}) => {
    const onAdvance = vi.fn()
    const hook = renderHook(() => useAutoAdvance({ count: 3, intervalMs: 5000, paused: false, onAdvance, ...opts }))
    return { onAdvance, ...hook }
  }

  it('advances once per interval', () => {
    const { onAdvance } = run()
    vi.advanceTimersByTime(4999)
    expect(onAdvance).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('does not advance while paused', () => {
    const { onAdvance } = run({ paused: true })
    vi.advanceTimersByTime(20000)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('does not advance with fewer than two slides', () => {
    const { onAdvance } = run({ count: 1 })
    vi.advanceTimersByTime(20000)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('does not advance when reduced motion is preferred', () => {
    stubReducedMotion(true)
    const { onAdvance } = run()
    vi.advanceTimersByTime(20000)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('reacts when the reduced-motion setting changes while mounted', () => {
    const media = stubReducedMotion(false)
    const { onAdvance } = run()
    act(() => media.set(true))
    vi.advanceTimersByTime(20000)
    expect(onAdvance).not.toHaveBeenCalled()
    act(() => media.set(false))
    vi.advanceTimersByTime(5000)
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('works when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { onAdvance } = run()
    vi.advanceTimersByTime(5000)
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('clears the timer on unmount', () => {
    const clear = vi.spyOn(globalThis, 'clearInterval')
    const { onAdvance, unmount } = run()
    unmount()
    expect(clear).toHaveBeenCalled()
    vi.advanceTimersByTime(20000)
    expect(onAdvance).not.toHaveBeenCalled()
  })
})
