import { describe, expect, it } from 'vitest'
import { getQuickContacts } from './contacts'

describe('getQuickContacts', () => {
  it('lists the six channels in order, only the last four opening a new tab', () => {
    expect(getQuickContacts().map((c) => c.label)).toEqual(['Trang chủ', 'Hotline', 'Zalo', 'Messenger', 'Shopee', 'Tiktok'])
    expect(getQuickContacts().map((c) => c.external)).toEqual([false, false, true, true, true, true])
  })

  it('leaves out entries whose address is empty', () => {
    const partial = getQuickContacts({ hotlineTel: 'tel:0900000000', zaloUrl: '', messengerUrl: 'https://m.me/', shopeeUrl: '', tiktokUrl: '' })
    expect(partial.map((c) => c.id)).toEqual(['home', 'phone', 'messenger'])
  })

  it('points home at the root and hotline at the tel link', () => {
    const [home, phone] = getQuickContacts()
    expect([home.href, phone.href]).toEqual(['/', 'tel:0900000000'])
  })
})
