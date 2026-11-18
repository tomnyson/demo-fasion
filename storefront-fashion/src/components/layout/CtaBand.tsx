import { SITE } from '@/config/site'
import { Button } from '@/components/ui/Button'

const PERKS = ['Từ 5 bộ', 'Thiết kế miễn phí', 'In tên số logo', 'Sản xuất nhanh'] as const

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="bg-brand py-12 text-brand-ink">
      <div className="container-site flex flex-col items-center gap-6 text-center">
        <h2 id="cta-title" className="text-3xl font-black uppercase">BẠN ĐANG CẦN ĐỒNG PHỤC CHO ĐỘI?</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" href={SITE.zaloUrl}>NHẮN ZALO NGAY</Button>
          <Button variant="outline" href={SITE.hotlineTel}>GỌI {SITE.hotlineDisplay}</Button>
        </div>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-brand-strong" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
