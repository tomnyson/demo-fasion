import { describe, expect, it } from 'vitest'
import { FOOTER_ABOUT_LINKS, FOOTER_SUPPORT_LINKS, MAIN_NAV } from './navigation'

describe('navigation', () => {
  it('has the main menu in order with category children under Sản phẩm', () => {
    expect(MAIN_NAV.map((n) => n.label)).toEqual(['Trang chủ', 'Sản phẩm', 'Sale', 'Tin tức', 'Thời trang', 'Liên hệ'])
    expect(MAIN_NAV[1].href).toBe('/san-pham')
    expect(MAIN_NAV[1].children?.map((c) => c.href)).toEqual(['/danh-muc/dam', '/danh-muc/vay', '/danh-muc/ao', '/danh-muc/quan'])
    expect(MAIN_NAV[1].children?.map((c) => c.label)).toEqual(['Đầm', 'Váy', 'Áo', 'Quần'])
    expect(MAIN_NAV[2].href).toBe('/bo-suu-tap/sale')
  })

  it('has the footer link groups', () => {
    expect(FOOTER_ABOUT_LINKS.map((l) => [l.label, l.href])).toEqual([
      ['Giới thiệu', '/gioi-thieu'],
      ['Tin thời trang', '/thoi-trang'],
      ['Liên hệ', '/lien-he'],
      ['Chính sách bảo mật', '/chinh-sach#bao-mat'],
    ])
    expect(FOOTER_SUPPORT_LINKS.map((l) => l.href)).toEqual(['/chinh-sach#huong-dan-mua-hang', '/chinh-sach#van-chuyen', '/chinh-sach#thanh-toan', '/chinh-sach#doi-hang'])
    expect(FOOTER_SUPPORT_LINKS.map((l) => l.label)).toEqual(['Hướng dẫn mua hàng', 'Chính sách vận chuyển', 'Phương thức thanh toán', 'Quy định đổi hàng'])
  })
})
