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

const link = (label: string, slug: string, children?: readonly NavItem[]): NavItem =>
  Object.freeze({ label, href: categoryHref(slug), ...(children ? { children } : {}) })

export const MAIN_NAV: readonly NavItem[] = Object.freeze([
  link('Áo bóng đá', 'ao-bong-da', [
    link('Không logo', 'ao-bong-da-khong-logo'),
    link('Thiết kế', 'ao-bong-da-thiet-ke'),
    link('Câu lạc bộ', 'ao-bong-da-cau-lac-bo'),
  ]),
  link('Áo cầu lông', 'ao-cau-long'),
  link('Pickleball', 'ao-pickleball'),
  link('Bóng chuyền', 'ao-bong-chuyen'),
  link('Bóng rổ', 'ao-bong-ro'),
  link('Polo', 'ao-polo'),
  link('Phụ kiện', 'phu-kien', [
    link('Giày', 'giay'),
    link('Bóng', 'bong'),
    link('Găng tay', 'gang-tay'),
    link('Tất', 'tat'),
  ]),
  Object.freeze({ label: 'Tin tức', href: '/tin-tuc' }),
])

export const POLICY_LINKS: readonly NavItem[] = Object.freeze([
  { label: 'Chính sách bảo mật', href: '/chinh-sach#bao-mat' },
  { label: 'Chính sách giao nhận', href: '/chinh-sach#giao-nhan' },
  { label: 'Chính sách đổi trả', href: '/chinh-sach#doi-tra' },
  { label: 'Chính sách thanh toán', href: '/chinh-sach#thanh-toan' },
])
