import { getCategory } from '@/lib/catalog/repository'

export interface NavItem {
  readonly label: string
  readonly href: string
  readonly children?: readonly NavItem[]
}

function categoryHref(slug: string): string {
  if (!getCategory(slug)) throw new Error(`Unknown category slug in navigation: ${slug}`)
  return `/danh-muc/${slug}`
}

const item = (label: string, href: string, children?: readonly NavItem[]): NavItem =>
  Object.freeze({ label, href, ...(children ? { children } : {}) })

const category = (label: string, slug: string): NavItem => item(label, categoryHref(slug))

export const MAIN_NAV: readonly NavItem[] = Object.freeze([
  item('Trang chủ', '/'),
  item('Sản phẩm', '/san-pham', [category('Đầm', 'dam'), category('Váy', 'vay'), category('Áo', 'ao'), category('Quần', 'quan')]),
  item('Sale', '/bo-suu-tap/sale'),
  item('Tin tức', '/tin-tuc'),
  item('Thời trang', '/thoi-trang'),
  item('Liên hệ', '/lien-he'),
])

export const FOOTER_ABOUT_LINKS: readonly NavItem[] = Object.freeze([
  item('Giới thiệu', '/gioi-thieu'),
  item('Tin thời trang', '/thoi-trang'),
  item('Liên hệ', '/lien-he'),
  item('Chính sách bảo mật', '/chinh-sach#bao-mat'),
])

export const FOOTER_SUPPORT_LINKS: readonly NavItem[] = Object.freeze([
  item('Hướng dẫn mua hàng', '/chinh-sach#huong-dan-mua-hang'),
  item('Chính sách vận chuyển', '/chinh-sach#van-chuyen'),
  item('Phương thức thanh toán', '/chinh-sach#thanh-toan'),
  item('Quy định đổi hàng', '/chinh-sach#doi-hang'),
])
