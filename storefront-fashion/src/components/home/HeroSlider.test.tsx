import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Slide } from '@/config/slides'
import { HeroSlider } from './HeroSlider'

const slides: readonly Slide[] = ['A', 'B', 'C'].map((title, i) => ({
  id: `s${i}`,
  title,
  image: `https://picsum.photos/seed/t${i}/1600/700`,
  imageMobile: `https://picsum.photos/seed/t${i}/800/1000`,
  href: i === 1 ? '/bo-suu-tap/hang-moi' : '/danh-muc/ao',
}))

const current = () => screen.getByRole('heading', { level: 2 }).textContent
const region = () => screen.getByRole('region', { name: 'Bộ sưu tập nổi bật' })
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

describe('HeroSlider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('advances on its own, wraps around and jumps by dot', () => {
    render(<HeroSlider slides={slides} />)
    expect(current()).toBe('A')
    act(() => vi.advanceTimersByTime(5000))
    expect(current()).toBe('B')
    click('Slide trước')
    expect(current()).toBe('A')
    click('Slide trước')
    expect(current()).toBe('C')
    click('Slide sau')
    expect(current()).toBe('A')
    click('Chuyển tới slide 2')
    expect(current()).toBe('B')
    expect(screen.getByRole('button', { name: 'Chuyển tới slide 2' }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('button', { name: 'Chuyển tới slide 1' }).getAttribute('aria-current')).toBeNull()
  })

  it('pauses on hover and while focus is inside', () => {
    render(<HeroSlider slides={slides} />)
    click('Chuyển tới slide 2')
    fireEvent.mouseEnter(region())
    act(() => vi.advanceTimersByTime(20000))
    expect(current()).toBe('B')
    fireEvent.mouseLeave(region())
    fireEvent.focus(screen.getByRole('button', { name: 'Slide sau' }))
    act(() => vi.advanceTimersByTime(20000))
    expect(current()).toBe('B')
    fireEvent.blur(screen.getByRole('button', { name: 'Slide sau' }), { relatedTarget: screen.getByRole('button', { name: 'Slide trước' }) })
    act(() => vi.advanceTimersByTime(20000))
    expect(current()).toBe('B')
    fireEvent.blur(screen.getByRole('button', { name: 'Slide trước' }), { relatedTarget: document.body })
    act(() => vi.advanceTimersByTime(5000))
    expect(current()).toBe('C')
  })

  it('links the visible slide and hides the others from assistive tech', () => {
    render(<HeroSlider slides={slides} />)
    click('Chuyển tới slide 2')
    expect(screen.getByRole('link', { name: 'MUA NGAY' })).toHaveProperty('pathname', slides[1].href)
    const hidden = region().querySelectorAll('[aria-hidden="true"][inert]')
    expect(hidden).toHaveLength(2)
  })

  it('swipes between slides on touch', () => {
    render(<HeroSlider slides={slides} />)
    const touch = (x: number) => ({ changedTouches: [{ clientX: x, clientY: 0 }], touches: [{ clientX: x, clientY: 0 }] })
    fireEvent.touchStart(region(), touch(300))
    fireEvent.touchEnd(region(), touch(100))
    expect(current()).toBe('B')
    fireEvent.touchStart(region(), touch(100))
    fireEvent.touchEnd(region(), touch(300))
    expect(current()).toBe('A')
    fireEvent.touchStart(region(), touch(100))
    fireEvent.touchEnd(region(), touch(120))
    expect(current()).toBe('A')
  })

  it('ignores a mostly vertical swipe so scrolling the page does not flip slides', () => {
    render(<HeroSlider slides={slides} />)
    const touch = (x: number, y: number) => ({ changedTouches: [{ clientX: x, clientY: y }], touches: [{ clientX: x, clientY: y }] })
    fireEvent.touchStart(region(), touch(300, 100))
    fireEvent.touchEnd(region(), touch(240, 400))
    expect(current()).toBe('A')
    fireEvent.touchStart(region(), touch(300, 100))
    fireEvent.touchEnd(region(), touch(200, 130))
    expect(current()).toBe('B')
  })

  it('shows no controls and no timer with a single slide', () => {
    render(<HeroSlider slides={[slides[0]]} />)
    expect(screen.queryByRole('button')).toBeNull()
    act(() => vi.advanceTimersByTime(20000))
    expect(current()).toBe('A')
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<HeroSlider slides={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
