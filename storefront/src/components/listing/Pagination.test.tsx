import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildPageItems, Pagination } from './Pagination'

describe('buildPageItems', () => {
  it('lists every page when there are few', () => {
    expect(buildPageItems(1, 2)).toEqual([1, 2])
    expect(buildPageItems(1, 1)).toEqual([1])
  })

  it('collapses distant pages into gaps around the current page', () => {
    expect(buildPageItems(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10])
  })
})

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} hrefFor={(p) => `?page=${p}`} />)
    expect(container.innerHTML).toBe('')
  })

  it('links pages, marks the current one and offers only the next arrow on page 1', () => {
    render(<Pagination page={1} pageCount={2} hrefFor={(p) => `/x?page=${p}`} />)
    expect(screen.getByRole('link', { name: '2' }).getAttribute('href')).toBe('/x?page=2')
    expect(screen.getByText('1').getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Trang sau' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Trang trước' })).toBeNull()
  })

  it('offers only the previous arrow on the last page and renders gaps', () => {
    render(<Pagination page={10} pageCount={10} hrefFor={(p) => `/x?page=${p}`} />)
    expect(screen.getByRole('link', { name: 'Trang trước' }).getAttribute('href')).toBe('/x?page=9')
    expect(screen.queryByRole('link', { name: 'Trang sau' })).toBeNull()
    expect(screen.getByText('…')).toBeTruthy()
  })
})
