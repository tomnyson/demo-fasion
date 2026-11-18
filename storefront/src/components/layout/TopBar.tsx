import { SITE } from '@/config/site'

export function TopBar() {
  return (
    <div className="bg-navy text-xs text-white">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <p className="hidden sm:block">Thiết kế miễn phí · Sản xuất nhanh · Giao hàng toàn quốc</p>
        <p className="mx-auto sm:mx-0">
          Tư vấn 24/7 · <a href={SITE.hotlineTel} className="font-semibold hover:underline">{SITE.hotlineDisplay}</a>
        </p>
      </div>
    </div>
  )
}
