import type { ReactNode } from 'react'
import type { ContactId } from '@/config/contacts'

const SHAPES: Readonly<Record<ContactId, ReactNode>> = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M10 20v-5.5h4V20" />,
  phone: <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.3.55 3.4a1 1 0 0 1-.25 1z" />,
  zalo: <path d="M4 5h16v11H11l-4.5 4v-4H4z M8.5 9.5h7M8.5 12.5h4" />,
  messenger: <path d="M4 5h16v11H11l-4.5 4v-4H4z M12.8 7.5l-3 4h3.4l-2 3.5" />,
  shopee: <path d="M5 8h14l-1 12H6zM9 8V7a3 3 0 0 1 6 0v1" />,
  tiktok: <path d="M10 18V5l8-2v13M10 18a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 10 18zm8-2a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 18 16z" />,
}

export function ContactIcon({ id }: { readonly id: ContactId }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 min-[850px]:h-8 min-[850px]:w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {SHAPES[id]}
    </svg>
  )
}
