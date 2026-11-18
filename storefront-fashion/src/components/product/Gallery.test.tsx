import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Gallery } from './Gallery'

const colors = [
  { name: 'Đỏ', image: 'https://picsum.photos/seed/a/800/800' },
  { name: 'Xanh', image: 'https://picsum.photos/seed/b/800/800' },
]

describe('Gallery', () => {
  it('shows the active colour and reports thumbnail selection', async () => {
    const onSelect = vi.fn()
    render(<Gallery name="Áo A" colors={colors} activeIndex={0} onSelect={onSelect} />)
    expect(screen.getByRole('img', { name: 'Áo A – Đỏ' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Màu Đỏ' }).getAttribute('aria-pressed')).toBe('true')
    await userEvent.click(screen.getByRole('button', { name: 'Màu Xanh' }))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('uses a portrait 3:4 box for the main image', () => {
    render(<Gallery name="Áo A" colors={colors} activeIndex={0} onSelect={vi.fn()} />)
    const box = screen.getByRole('img', { name: 'Áo A – Đỏ' }).parentElement
    expect(box?.className).toContain('aspect-[3/4]')
  })
})
