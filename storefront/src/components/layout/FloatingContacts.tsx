import { SITE } from '@/config/site'

const BTN = 'grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-white shadow-card transition hover:scale-105'

export function FloatingContacts() {
  return (
    <div className="fixed bottom-5 left-5 z-30 hidden flex-col gap-3 min-[850px]:flex">
      <a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo" className={`${BTN} bg-brand`}>
        <span aria-hidden="true">Zalo</span>
      </a>
      <a href={SITE.hotlineTel} aria-label={`Gọi điện ${SITE.hotlineDisplay}`} className={`${BTN} bg-accent`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11 11 0 003.4.55 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.3.55 3.4a1 1 0 01-.25 1z" />
        </svg>
      </a>
      <a href={SITE.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={`${BTN} bg-navy`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M14 8V6.5c0-.7.2-1 1.2-1H17V2.2C16.6 2.1 15.6 2 14.5 2 12 2 10.3 3.5 10.3 6.2V8H7.5v3.5h2.8V22H14V11.5h2.7L17 8z" />
        </svg>
      </a>
    </div>
  )
}
