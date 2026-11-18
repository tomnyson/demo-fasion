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

function ShopColumn() {
  return (
    <section>
      <h2 className={HEADING}>THỜI TRANG NỮ LÁ STUDIO</h2>
      <address className="mt-4 space-y-2 text-sm not-italic text-muted">
        <p>{SITE.tagline}. Thiết kế nhẹ nhàng, dễ mặc cho mọi dáng người.</p>
        <p>Hotline: <a href={SITE.hotlineTel} className="font-semibold text-ink hover:text-brand-strong">{SITE.hotlineDisplay}</a></p>
        <p>{SITE.openingHours}</p>
        <p>Email: <a href={`mailto:${SITE.email}`} className="hover:text-brand-strong">{SITE.email}</a></p>
        <p>{SITE.address}</p>
      </address>
    </section>
  )
}

const SOCIAL: readonly { readonly label: string; readonly href: string }[] = [
  { label: 'Facebook', href: SITE.facebookUrl },
  { label: 'Tiktok', href: SITE.tiktokUrl },
  { label: 'Shopee', href: SITE.shopeeUrl },
]

function ConnectColumn() {
  return (
    <section>
      <h2 className={HEADING}>KẾT NỐI</h2>
      <ul className="mt-4 space-y-2">
        {SOCIAL.filter((s) => s.href !== '').map((s) => (
          <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className={LINK}>{s.label}</a></li>
        ))}
      </ul>
      <h3 className={`${HEADING} mt-6`}>PHƯƠNG THỨC THANH TOÁN</h3>
      <ul className="mt-3 flex gap-2 text-xs font-semibold text-ink">
        <li className="rounded-product border border-line px-3 py-1">COD</li>
        <li className="rounded-product border border-line px-3 py-1">Chuyển khoản</li>
      </ul>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="border-t border-line bg-white">
        <div className="container-site grid gap-8 py-12 min-[850px]:grid-cols-4">
          <ShopColumn />
          <LinkColumn title="GIỚI THIỆU" items={FOOTER_ABOUT_LINKS} />
          <LinkColumn title="HỖ TRỢ KHÁCH HÀNG" items={FOOTER_SUPPORT_LINKS} />
          <ConnectColumn />
        </div>
      </div>
      <div className="bg-brand text-xs text-brand-ink">
        <p className="container-site py-4 text-center">© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  )
}
