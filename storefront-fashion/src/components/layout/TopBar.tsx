import { SITE } from '@/config/site'

export function TopBar() {
  return (
    <div className="bg-brand text-xs text-brand-ink">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <p className="hidden sm:block">Thiết kế miễn phí · Sản xuất nhanh · Giao hàng toàn quốc</p>
        <p className="mx-auto sm:mx-0">
          Tư vấn 24/7 · <a href={SITE.hotlineTel} className="font-semibold hover:underline">{SITE.hotlineDisplay}</a>
        </p>
      </div>
    </div>
  )
}
