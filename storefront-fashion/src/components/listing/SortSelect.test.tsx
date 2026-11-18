import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SORT_LABELS } from '@/lib/catalog/repository'
import { SortSelect } from './SortSelect'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/danh-muc/ao',
  useSearchParams: () => new URLSearchParams('page=2&sort=newest'),
}))

describe('SortSelect', () => {
  beforeEach(() => push.mockClear())

  it('lists every sort label and drops the page on change', async () => {
    render(<SortSelect value="newest" />)
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(Object.values(SORT_LABELS))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sắp xếp' }), 'price-asc')
    expect(push).toHaveBeenCalledWith('/danh-muc/ao?sort=price-asc')
  })
})
