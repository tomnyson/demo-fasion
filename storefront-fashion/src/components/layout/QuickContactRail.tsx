import { getQuickContacts, type QuickContact } from '@/config/contacts'
import { ContactIcon } from './ContactIcon'

const LINK =
  'flex h-full w-full flex-col items-center justify-center gap-1 bg-brand text-brand-ink transition-colors hover:bg-brand-hover focus-visible:bg-brand-hover focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-strong min-[850px]:h-[84px] min-[850px]:w-[84px] min-[850px]:rounded-contact min-[850px]:shadow-card min-[850px]:focus-visible:outline-offset-2'

function ContactLink({ contact }: { readonly contact: QuickContact }) {
  const external = contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a href={contact.href} {...external} className={LINK}>
      <ContactIcon id={contact.id} />
      <span className="text-[10px] font-medium leading-none min-[850px]:text-xs min-[850px]:font-semibold">{contact.label}</span>
    </a>
  )
}

export function QuickContactRail({ contacts = getQuickContacts() }: { readonly contacts?: readonly QuickContact[] }) {
  if (contacts.length === 0) return null
  return (
    <nav
      aria-label="Liên hệ nhanh"
      className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-line min-[850px]:inset-x-auto min-[850px]:bottom-auto min-[850px]:right-2 min-[850px]:top-1/2 min-[850px]:h-auto min-[850px]:-translate-y-1/2 min-[850px]:border-0"
    >
      <ul className="flex h-full min-[850px]:flex-col min-[850px]:gap-[10px]">
        {contacts.map((contact) => (
          <li key={contact.id} className="min-w-0 flex-1 min-[850px]:flex-none">
            <ContactLink contact={contact} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
