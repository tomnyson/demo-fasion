import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getPosts } from '@/lib/content/posts'
import { PostListPage } from './PostListPage'

describe('PostListPage', () => {
  it('lists only its section, each post as an article linking to /tin-tuc/<slug>', () => {
    render(<PostListPage section="thoi-trang" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Thời trang' })).toBeTruthy()
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(3)
    getPosts('thoi-trang').forEach((post, index) => {
      expect(within(articles[index]).getByRole('link', { name: post.title }).getAttribute('href')).toBe(`/tin-tuc/${post.slug}`)
    })
  })

  it('titles the news section', () => {
    render(<PostListPage section="tin-tuc" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Tin tức' })).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(3)
  })
})
