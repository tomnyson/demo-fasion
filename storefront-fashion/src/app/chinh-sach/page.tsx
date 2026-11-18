import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { POLICY_SECTIONS } from '@/lib/content/policies'

export const metadata: Metadata = { title: 'Chính sách' }

export default function PolicyPage() {
  return (
    <div className="container-site py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách' }]} />
      <h1 className="mt-4 text-[30px] font-black leading-tight text-ink">Chính sách</h1>
      <div className="mt-6 space-y-6">
        {POLICY_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-32 rounded-card border border-line bg-white p-6 shadow-card"
          >
            <h2 id={`${section.id}-title`} className="text-xl font-bold text-ink">{section.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
