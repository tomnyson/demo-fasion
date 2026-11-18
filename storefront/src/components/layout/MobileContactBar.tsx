import { SITE } from '@/config/site'

interface Shortcut { readonly label: string; readonly href: string; readonly external: boolean }

const SHORTCUTS: readonly Shortcut[] = [
  { label: 'Gọi điện', href: SITE.hotlineTel, external: false },
  { label: 'Facebook', href: SITE.facebookUrl, external: true },
  { label: 'Chat Zalo', href: SITE.zaloUrl, external: true },
  { label: 'Messenger', href: SITE.messengerUrl, external: true },
  { label: 'Chỉ đường', href: SITE.mapUrl, external: true },
]

export function MobileContactBar() {
  return (
    <nav aria-label="Liên hệ nhanh" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white min-[850px]:hidden">
      {SHORTCUTS.map(({ label, href, external }) => (
        <a
          key={label}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="py-3 text-center text-[11px] font-semibold text-ink hover:text-brand"
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
