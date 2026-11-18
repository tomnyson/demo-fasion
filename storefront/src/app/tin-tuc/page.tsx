import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SectionHead } from '@/components/ui/SectionHead'
import { getPosts } from '@/lib/content/posts'
import { formatDate } from '@/lib/format'

export const metadata: Metadata = { title: 'Tin tức' }

export default function NewsPage() {
  return (
    <div className="container-site py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức' }]} />
      <div className="mt-6">
        <SectionHead kicker="Tin tức" title="KINH NGHIỆM ĐỒNG PHỤC ĐỘI NHÓM" />
      </div>
      <ul className="mt-8 grid gap-6 min-[850px]:grid-cols-3">
        {getPosts().map((post) => (
          <li key={post.slug}>
            <article className="overflow-hidden rounded-card border border-line bg-white shadow-card">
              <div className="relative aspect-[16/10]">
                <Image src={post.image} alt="" fill sizes="(max-width: 849px) 100vw, 380px" className="object-cover" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase text-brand">{post.tag} · {formatDate(post.date)}</p>
                <h2 className="mt-2 text-lg font-bold leading-snug text-ink">
                  <Link href={`/tin-tuc/${post.slug}`} className="hover:text-brand">{post.title}</Link>
                </h2>
                <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
