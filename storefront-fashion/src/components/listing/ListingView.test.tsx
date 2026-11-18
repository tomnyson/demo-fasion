import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listProducts } from '@/lib/catalog/repository'
import { ListingView } from './ListingView'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/bo-suu-tap/sale',
  useSearchParams: () => new URLSearchParams(''),
}))

describe('ListingView', () => {
  afterEach(cleanup)

  it('renders heading, count line, grid and no pagination for a single page', () => {
    const result = listProducts({ collectionSlug: 'sale' })
    render(
      <ListingView
        title="Sale"
        crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sale' }]}
        result={result}
        sort="newest"
        basePath="/bo-suu-tap/sale"
        emptyMessage="x"
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Sale' })).toBeTruthy()
    expect(screen.getByText('Hiển thị 1–16 của 16 kết quả')).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(16)
    expect(screen.queryByRole('navigation', { name: 'Phân trang' })).toBeNull()
  })

  it('shows only the empty message when there are no results', () => {
    render(
      <ListingView title="A" crumbs={[]} result={listProducts({ query: 'zzzz' })} sort="newest" basePath="/san-pham" emptyMessage="Chưa có sản phẩm." />,
    )
    expect(screen.getByText('Chưa có sản phẩm.')).toBeTruthy()
    expect(screen.queryByText(/Hiển thị/)).toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('builds pagination links with q, sort and page in that order', () => {
    render(
      <ListingView title="A" crumbs={[]} result={listProducts({})} sort="price-asc" basePath="/san-pham" query="a b" emptyMessage="x" />,
    )
    expect(screen.getByRole('link', { name: '2' }).getAttribute('href')).toBe('/san-pham?q=a+b&sort=price-asc&page=2')
  })

  it('omits default sort and page 1 and can hide the sort select', () => {
    render(
      <ListingView title="A" crumbs={[]} result={listProducts({ page: 2 })} sort="newest" basePath="/san-pham" showSort={false} emptyMessage="x" />,
    )
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.getByRole('link', { name: '1' }).getAttribute('href')).toBe('/san-pham')
    expect(screen.getByRole('link', { name: '3' }).getAttribute('href')).toBe('/san-pham?page=3')
  })
})
