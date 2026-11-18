import { describe, expect, it } from 'vitest'
import { getCategories, listProducts } from '@/lib/catalog/repository'
import { getPost, getPosts, POST_SECTIONS } from './posts'
import { POLICY_SECTIONS } from './policies'
import { FREE_SHIP_MIN_ITEMS, SHIPPING_FEE } from '@/config/commerce'
import { formatVnd } from '@/lib/format'

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

describe('post sections', () => {
  it('splits the posts three and three, newest first within a section', () => {
    expect(getPosts('tin-tuc')).toHaveLength(3)
    expect(getPosts('thoi-trang')).toHaveLength(3)
    expect(getPosts('thoi-trang').every((p) => p.section === 'thoi-trang')).toBe(true)
    expect(getPosts('tin-tuc').every((p) => p.section === 'tin-tuc')).toBe(true)
    const dates = getPosts('thoi-trang').map((p) => p.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('names each section and its path', () => {
    expect(POST_SECTIONS['tin-tuc']).toEqual({ name: 'Tin tức', path: '/tin-tuc' })
    expect(POST_SECTIONS['thoi-trang']).toEqual({ name: 'Thời trang', path: '/thoi-trang' })
  })
})

describe('policies and copy hygiene', () => {
  it('has the five policy sections in footer order', () => {
    expect(POLICY_SECTIONS.map((s) => s.id)).toEqual(['bao-mat', 'van-chuyen', 'doi-hang', 'thanh-toan', 'huong-dan-mua-hang'])
  })

  it('states the shipping rule from the commerce constants', () => {
    const shipping = JSON.stringify(POLICY_SECTIONS.find((s) => s.id === 'van-chuyen'))
    expect(shipping).toContain(formatVnd(SHIPPING_FEE))
    expect(shipping).toContain(`${FREE_SHIP_MIN_ITEMS} sản phẩm`)
  })

  it('has no sportswear, made-to-order or quotation wording', () => {
    const everything = JSON.stringify([getPosts(), POLICY_SECTIONS, getCategories(), listProducts({ pageSize: 64 }).items])
    expect(everything).not.toMatch(/đội nhóm|thể thao|thi đấu|in tên|đặt cọc/i)
  })
})
