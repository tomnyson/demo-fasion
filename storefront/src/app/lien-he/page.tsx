import type { Metadata } from 'next'
import { QuoteForm } from '@/components/quote/QuoteForm'
import { SITE } from '@/config/site'
import { getSportOptions } from '@/lib/quotes/sports'

export const metadata: Metadata = { title: 'Liên hệ' }

const LINK = 'font-semibold text-brand underline underline-offset-2'

export default function ContactPage() {
  return (
    <div className="container-site py-10">
      <h1 className="mb-6 text-[28px] font-black uppercase text-navy">Liên hệ</h1>
      <div className="grid items-start gap-6 min-[850px]:grid-cols-2">
        <address className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 text-sm not-italic text-ink shadow-card">
          <p className="text-base font-black text-navy">{SITE.name}</p>
          <p>Địa chỉ: {SITE.address}</p>
          <p>
            Hotline: <a href={SITE.hotlineTel} className={LINK}>{SITE.hotlineDisplay}</a>
          </p>
          <p>
            Email: <a href={`mailto:${SITE.email}`} className={LINK}>{SITE.email}</a>
          </p>
          <p>
            <a href={SITE.mapUrl} target="_blank" rel="noopener noreferrer" className={LINK}>Xem bản đồ</a>
          </p>
        </address>
        <QuoteForm sports={getSportOptions()} compact />
      </div>
    </div>
  )
}
