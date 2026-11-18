// Demo photos stored in public/demo (sources and licences: public/demo/CREDITS.md).
// Replace the files, or the paths below, with the shop's own photos.

const demo = (name: string): string => `/demo/${name}.jpg`

export const HERO_IMAGE = demo('hero')
export const ABOUT_IMAGE = demo('about')

export const PROJECT_IMAGES = Object.freeze({
  team: demo('cat-football'),
  school: demo('cat-volleyball'),
  company: demo('polo-2'),
})

const FALLBACK_BANNER = demo('hero')

const CATEGORY_BANNERS: Readonly<Record<string, string>> = Object.freeze({
  'ao-bong-da': demo('cat-football'),
  'ao-bong-da-khong-logo': demo('football-1'),
  'ao-bong-da-thiet-ke': demo('football-2'),
  'ao-bong-da-cau-lac-bo': demo('football-3'),
  'ao-cau-long': demo('cat-badminton'),
  'ao-pickleball': demo('cat-pickleball'),
  'ao-bong-chuyen': demo('cat-volleyball'),
  'ao-bong-ro': demo('cat-basketball'),
  'ao-polo': demo('cat-polo'),
  'phu-kien': demo('shoes-1'),
  giay: demo('shoes-1'),
  bong: demo('ball-1'),
  'gang-tay': demo('gloves-1'),
  tat: demo('socks-1'),
})

const FOOTBALL_POOL = Object.freeze([demo('football-1'), demo('football-2'), demo('football-3'), demo('cat-football')])

const PRODUCT_POOLS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  'ao-bong-da-khong-logo': FOOTBALL_POOL,
  'ao-bong-da-thiet-ke': FOOTBALL_POOL,
  'ao-bong-da-cau-lac-bo': FOOTBALL_POOL,
  'ao-cau-long': Object.freeze([demo('badminton-1'), demo('cat-badminton')]),
  'ao-pickleball': Object.freeze([demo('cat-pickleball'), demo('badminton-1')]),
  'ao-bong-chuyen': Object.freeze([demo('volleyball-1'), demo('cat-volleyball')]),
  'ao-bong-ro': Object.freeze([demo('basketball-1'), demo('cat-basketball')]),
  'ao-polo': Object.freeze([demo('polo-1'), demo('polo-2'), demo('cat-polo')]),
  giay: Object.freeze([demo('shoes-1')]),
  bong: Object.freeze([demo('ball-1')]),
  'gang-tay': Object.freeze([demo('gloves-1')]),
  tat: Object.freeze([demo('socks-1')]),
})

export function categoryBanner(slug: string): string {
  return CATEGORY_BANNERS[slug] ?? FALLBACK_BANNER
}

/** Picks a demo photo for one colour of one product, rotating through the category's pool. */
export function productImage(categorySlug: string, productIndex: number, colorIndex: number): string {
  const pool = PRODUCT_POOLS[categorySlug]
  if (!pool || pool.length === 0) return FALLBACK_BANNER
  return pool[(productIndex + colorIndex) % pool.length]
}
