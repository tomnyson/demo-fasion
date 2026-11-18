export interface Slide {
  readonly id: string
  readonly title: string
  readonly image: string
  readonly imageMobile: string
  readonly href: string
}

const slide = (id: string, title: string, href: string): Slide =>
  Object.freeze({
    id,
    title,
    href,
    image: `https://picsum.photos/seed/${id}/1600/700`,
    imageMobile: `https://picsum.photos/seed/${id}/800/1000`,
  })

export const SLIDES: readonly Slide[] = Object.freeze([
  slide('la-slide-dam', 'Đầm nhẹ nhàng cho mùa mới', '/danh-muc/dam'),
  slide('la-slide-moi', 'Hàng mới về mỗi tuần', '/bo-suu-tap/hang-moi'),
  slide('la-slide-ao', 'Áo mềm mịn, phối dễ mặc đẹp', '/danh-muc/ao'),
])
