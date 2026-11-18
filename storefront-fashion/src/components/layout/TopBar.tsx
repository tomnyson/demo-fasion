import Link from 'next/link'
import { SITE } from '@/config/site'

export function TopBar() {
  return (
    <div className="bg-brand text-xs text-brand-ink">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <p>
          Hỗ trợ khách hàng: <a href={SITE.hotlineTel} className="font-semibold hover:underline">{SITE.hotlineDisplay}</a>
        </p>
        <Link href="/chinh-sach" className="hover:underline">Điều khoản – Chính sách</Link>
      </div>
    </div>
  )
}
