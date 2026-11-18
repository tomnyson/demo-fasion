import { describe, expect, it } from 'vitest'
import { getCategories, listProducts } from '@/lib/catalog/repository'
import { getPost, getPosts } from './posts'
import { POLICY_SECTIONS } from './policies'

describe('posts', () => {
  const posts = getPosts()

  it('has six posts with unique slugs', () => {
    expect(posts).toHaveLength(6)
    expect(new Set(posts.map((p) => p.slug)).size).toBe(6)
  })

  it('lists newest first', () => {
    expect(posts.map((p) => p.date)).toEqual([...posts.map((p) => p.date)].sort().reverse())
  })

  it('finds a post by slug and returns null for an unknown slug', () => {
    expect(getPost(posts[0].slug)).toEqual(posts[0])
    expect(getPost('khong-ton-tai')).toBeNull()
  })

  it('gives every post body text, a picsum image and an ISO date', () => {
    for (const post of posts) {
      expect(post.body.length).toBeGreaterThan(1)
      expect(post.image).toMatch(/^https:\/\/picsum\.photos\/seed\//)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('policies and brand hygiene', () => {
  it('has the four policy sections in footer order', () => {
    expect(POLICY_SECTIONS.map((s) => s.id)).toEqual(['bao-mat', 'giao-nhan', 'doi-tra', 'thanh-toan'])
  })

  it('never mentions the reference brand', () => {
    const everything = JSON.stringify([getPosts(), POLICY_SECTIONS, getCategories(), listProducts({ pageSize: 64 }).items])
    expect(everything).not.toMatch(/enzo/i)
  })
})
