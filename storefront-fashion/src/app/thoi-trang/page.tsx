import type { Metadata } from 'next'
import { PostListPage } from '@/components/content/PostListPage'

export const metadata: Metadata = { title: 'Thời trang' }

export default function FashionPage() {
  return <PostListPage section="thoi-trang" />
}
