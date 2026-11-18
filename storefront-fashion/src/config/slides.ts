import { SLIDE_IMAGES } from './demo-images'

export interface Slide {
  readonly id: string
  readonly title: string
  readonly image: string
  readonly imageMobile: string
  readonly href: string
}

const slide = (id: string, title: string, href: string, images: { readonly desktop: string; readonly mobile: string }): Slide =>
  Object.freeze({ id, title, href, image: images.desktop, imageMobile: images.mobile })

export const SLIDES: readonly Slide[] = Object.freeze([
  slide('la-slide-dam', 'Đầm nhẹ nhàng cho mùa mới', '/danh-muc/dam', SLIDE_IMAGES.dresses),
  slide('la-slide-moi', 'Hàng mới về mỗi tuần', '/bo-suu-tap/hang-moi', SLIDE_IMAGES.newArrivals),
  slide('la-slide-ao', 'Áo mềm mịn, phối dễ mặc đẹp', '/danh-muc/ao', SLIDE_IMAGES.tops),
])
