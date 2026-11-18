import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MAIN_NAV } from '@/config/navigation'
import { MobileMenu } from './MobileMenu'

describe('MobileMenu', () => {
  it('opens and closes with Escape', async () => {
    const user = userEvent.setup(); render(<MobileMenu items={MAIN_NAV} />)
    const toggle = screen.getByRole('button', { name: 'Mở menu' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    await user.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Đầm' })).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('renders no links while closed', () => {
    render(<MobileMenu items={MAIN_NAV} />)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('closes from the close button and on link click', async () => {
    const user = userEvent.setup(); render(<MobileMenu items={MAIN_NAV} />)
    const toggle = screen.getByRole('button', { name: 'Mở menu' })
    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: 'Đóng menu' }))
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    await user.click(toggle)
    const stopNavigation = (event: Event) => event.preventDefault()
    document.addEventListener('click', stopNavigation)
    await user.click(screen.getByRole('link', { name: 'Quần' }))
    document.removeEventListener('click', stopNavigation)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('offers search inside the panel and no price-request button', async () => {
    const user = userEvent.setup(); render(<MobileMenu items={MAIN_NAV} />)
    await user.click(screen.getByRole('button', { name: 'Mở menu' }))
    expect(screen.getByLabelText('Tìm sản phẩm').getAttribute('name')).toBe('q')
    expect(screen.queryByRole('link', { name: /NHẬN/ })).toBeNull()
  })
})
