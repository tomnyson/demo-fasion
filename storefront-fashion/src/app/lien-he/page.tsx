import type { Metadata } from 'next'
import { ContactIcon } from '@/components/layout/ContactIcon'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getQuickContacts } from '@/config/contacts'
import { SITE } from '@/config/site'

export const metadata: Metadata = { title: 'Liên hệ' }

const LINK = 'font-semibold text-brand-strong underline underline-offset-2'
const BUTTON =
  'flex flex-col items-center justify-center gap-2 rounded-card bg-brand p-4 text-center text-sm font-bold text-brand-ink hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

export default function ContactPage() {
  const channels = getQuickContacts().filter((contact) => contact.id !== 'home')
  return (
    <div className="container-site py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]} />
      <h1 className="mt-4 text-[30px] font-black leading-tight text-ink">Liên hệ</h1>
      <div className="mt-6 max-w-xl">
        <address className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 text-sm not-italic text-ink shadow-card">
          <p className="text-base font-black text-ink">{SITE.name}</p>
          <p>Địa chỉ: {SITE.address}</p>
          <p>
            Hotline: <a href={SITE.hotlineTel} className={LINK}>{SITE.hotlineDisplay}</a>
          </p>
          <p>
            Email: <a href={`mailto:${SITE.email}`} className={LINK}>{SITE.email}</a>
          </p>
          <p>Giờ mở cửa: {SITE.openingHours}</p>
          <p>
            <a href={SITE.mapUrl} target="_blank" rel="noopener noreferrer" className={LINK}>Xem bản đồ</a>
          </p>
        </address>
      </div>
      <h2 className="mt-8 text-xl font-bold text-ink">Nhắn tin cho chúng tôi</h2>
      <ul className="mt-4 grid max-w-xl grid-cols-2 gap-3 min-[850px]:grid-cols-3">
        {channels.map((contact) => (
          <li key={contact.id}>
            <a
              href={contact.href}
              {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={BUTTON}
            >
              <ContactIcon id={contact.id} />
              <span>{contact.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
