import type { Metadata } from 'next'
import { QuoteForm } from '@/components/quote/QuoteForm'
import { Button } from '@/components/ui/Button'
import { SITE } from '@/config/site'
import { getProduct } from '@/lib/catalog/repository'
import { getSportOptions, sportForCategory } from '@/lib/quotes/sports'

export const metadata: Metadata = {
  title: 'Nhận báo giá',
  description: 'Gửi yêu cầu để nhận báo giá đồng phục thể thao may theo yêu cầu từ 5 bộ.',
}

interface QuotePageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const { 'san-pham': slugParam } = await searchParams
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam
  const product = slug === undefined ? null : getProduct(slug)

  return (
    <div className="container-site py-10">
      <h1 className="mb-6 text-[28px] font-black uppercase text-ink">Nhận báo giá</h1>
      <div className="grid items-start gap-6 min-[850px]:grid-cols-[1fr_380px]">
        <QuoteForm
          sports={getSportOptions()}
          product={product === null ? undefined : { slug: product.slug, name: product.name }}
          defaultSport={product === null ? undefined : sportForCategory(product.categorySlug)}
        />
        <aside aria-label="Liên hệ nhanh" className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-sm text-ink">Cần tư vấn ngay? Liên hệ trực tiếp với chúng tôi.</p>
          <Button variant="primary" href={SITE.hotlineTel}>GỌI {SITE.hotlineDisplay}</Button>
          <Button variant="soft" href={SITE.zaloUrl}>NHẮN ZALO NGAY</Button>
        </aside>
      </div>
    </div>
  )
}
