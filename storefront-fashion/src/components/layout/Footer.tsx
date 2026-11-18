import Link from 'next/link'
import { FOOTER_ABOUT_LINKS, FOOTER_SUPPORT_LINKS, type NavItem } from '@/config/navigation'
import { SITE } from '@/config/site'

const HEADING = 'text-sm font-bold uppercase text-ink'
const LINK = 'text-sm text-muted hover:text-brand-strong'

function LinkColumn({ title, items }: { readonly title: string; readonly items: readonly NavItem[] }) {
  return (
    <section>
      <h2 className={HEADING}>{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={LINK}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="border-t border-line bg-white">
        <div className="container-site grid gap-8 py-12 md:grid-cols-4">
          <LinkColumn title="VỀ CHÚNG TÔI" items={FOOTER_ABOUT_LINKS} />
          <LinkColumn title="HỖ TRỢ KHÁCH HÀNG" items={FOOTER_SUPPORT_LINKS} />
          <section>
            <h2 className={HEADING}>KẾT NỐI VỚI CHÚNG TÔI</h2>
            <ul className="mt-4 space-y-2">
              <li><a href={SITE.facebookUrl} target="_blank" rel="noopener noreferrer" className={LINK}>Facebook</a></li>
              <li><a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer" className={LINK}>Zalo</a></li>
              <li><a href={SITE.messengerUrl} target="_blank" rel="noopener noreferrer" className={LINK}>Messenger</a></li>
            </ul>
          </section>
          <section>
            <h2 className={HEADING}>THÔNG TIN LIÊN HỆ</h2>
            <address className="mt-4 space-y-2 text-sm not-italic text-muted">
              <p className="font-semibold text-ink">{SITE.name}</p>
              <p>{SITE.address}</p>
              <p>Hotline: <a href={SITE.hotlineTel} className="font-semibold text-ink hover:text-brand-strong">{SITE.hotlineDisplay}</a></p>
              <p>Email: <a href={`mailto:${SITE.email}`} className="hover:text-brand-strong">{SITE.email}</a></p>
            </address>
          </section>
        </div>
      </div>
      <div className="bg-brand text-xs text-brand-ink">
        <p className="container-site py-4 text-center">© 2026 {SITE.name}. Mọi quyền được bảo lưu.</p>
      </div>
    </footer>
  )
}
