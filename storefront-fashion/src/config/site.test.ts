import { describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY } from './commerce'
import { SITE } from './site'

describe('SITE', () => {
  it('carries the La Studio brand values', () => {
    expect(SITE.name).toBe('Lá Studio')
    expect(SITE).toMatchObject({
      tagline: 'Thời trang nữ mỗi ngày',
      hotlineDisplay: '0900 000 000',
      hotlineTel: 'tel:0900000000',
      zaloUrl: 'https://zalo.me/0900000000',
      messengerUrl: 'https://m.me/',
      facebookUrl: 'https://facebook.com/',
      shopeeUrl: 'https://shopee.vn/',
      tiktokUrl: 'https://www.tiktok.com/',
      openingHours: '8:30 – 21:00 tất cả các ngày trong tuần',
      email: 'hello@lastudio.example',
      address: '123 Đường Mẫu, Phường Mẫu, TP. Hồ Chí Minh',
      mapUrl: 'https://maps.google.com/',
    })
  })

  it('uses a brand specific cart storage key', () => {
    expect(CART_STORAGE_KEY).toBe('la-studio-cart-v1')
  })
})
