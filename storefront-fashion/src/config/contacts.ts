import { SITE } from '@/config/site'

export type ContactId = 'home' | 'phone' | 'zalo' | 'messenger' | 'shopee' | 'tiktok'

export interface QuickContact {
  readonly id: ContactId
  readonly label: string
  readonly href: string
  readonly external: boolean
}

export interface ContactSource {
  readonly hotlineTel: string
  readonly zaloUrl: string
  readonly messengerUrl: string
  readonly shopeeUrl: string
  readonly tiktokUrl: string
}

export function getQuickContacts(site: ContactSource = SITE): readonly QuickContact[] {
  const all: readonly QuickContact[] = [
    { id: 'home', label: 'Trang chủ', href: '/', external: false },
    { id: 'phone', label: 'Hotline', href: site.hotlineTel, external: false },
    { id: 'zalo', label: 'Zalo', href: site.zaloUrl, external: true },
    { id: 'messenger', label: 'Messenger', href: site.messengerUrl, external: true },
    { id: 'shopee', label: 'Shopee', href: site.shopeeUrl, external: true },
    { id: 'tiktok', label: 'Tiktok', href: site.tiktokUrl, external: true },
  ]
  return Object.freeze(all.filter((contact) => contact.href !== ''))
}
