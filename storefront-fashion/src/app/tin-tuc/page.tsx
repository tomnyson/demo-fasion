import type { Metadata } from 'next'
import { PostListPage } from '@/components/content/PostListPage'

export const metadata: Metadata = { title: 'Tin tức' }

export default function NewsPage() {
  return <PostListPage section="tin-tuc" />
}
