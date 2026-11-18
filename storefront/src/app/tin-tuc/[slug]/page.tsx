import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getPost, getPosts } from '@/lib/content/posts'
import { formatDate } from '@/lib/format'

interface PostPageProps {
  readonly params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  return { title: post?.title ?? 'Không tìm thấy trang', description: post?.excerpt }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (post === null) notFound()

  return (
    <div className="container-site py-8">
      <Breadcrumb
        items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức', href: '/tin-tuc' }, { label: post.title }]}
      />
      <article className="mx-auto mt-6 max-w-[760px]">
        <p className="text-sm font-bold uppercase text-brand">{post.tag} · {formatDate(post.date)}</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-navy">{post.title}</h1>
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-card">
          <Image src={post.image} alt="" fill priority sizes="(max-width: 849px) 100vw, 760px" className="object-cover" />
        </div>
        <div className="mt-6 space-y-4 leading-relaxed text-ink">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
