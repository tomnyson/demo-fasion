import { CATEGORIES } from './categories'
import { normalizeText } from '../text'
import type { Product, ProductColor, ProductKind, Size } from './types'

const SHIRT_SIZES: readonly Size[] = ['S', 'M', 'L', 'XL', 'XXL']
const FREE_SIZE: readonly Size[] = ['Free']
const COLOR_NAMES = ['Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Đen', 'Trắng'] as const
const DESIGN_NAMES = [
  'Tia Chớp', 'Sóng Biển', 'Rồng Lửa', 'Gió Núi', 'Sao Đêm', 'Bão Cát', 'Lốc Xanh', 'Mây Trắng',
  'Thác Đổ', 'Đại Bàng', 'Phượng Hoàng', 'Hải Âu', 'Báo Đen', 'Sư Tử', 'Cánh Đồng', 'Ngân Hà',
  'Bình Minh', 'Hoàng Hôn', 'Sương Mai', 'Giông Tố',
] as const
const BASE_DATE = Date.UTC(2026, 10, 1)
const DAY_MS = 86_400_000

interface Spec {
  readonly categorySlug: string
  readonly prefix: string
  readonly count: number
  readonly kind: ProductKind
  readonly colorCount: number
  readonly prices: (index: number) => { price: number; compareAtPrice: number | null }
  readonly sizes: readonly Size[]
}

const fixedPrice = (price: number, compareAtPrice: number | null) => () => ({ price, compareAtPrice })
const stepPrice = (start: number, step: number) => (i: number) => ({ price: start + step * i, compareAtPrice: null })

const shirt = (categorySlug: string, prefix: string, count: number, price: Spec['prices']): Spec => ({
  categorySlug, prefix, count, kind: 'custom', colorCount: 3, prices: price, sizes: SHIRT_SIZES,
})
const accessory = (categorySlug: string, prefix: string, start: number, step: number): Spec => ({
  categorySlug, prefix, count: 4, kind: 'ready', colorCount: 3, prices: stepPrice(start, step), sizes: FREE_SIZE,
})

const SPECS: readonly Spec[] = [
  { ...shirt('ao-bong-da-khong-logo', 'BD-KL', 20, fixedPrice(129000, 139000)), kind: 'ready', colorCount: 6 },
  shirt('ao-bong-da-thiet-ke', 'BD-TK', 4, fixedPrice(139000, null)),
  shirt('ao-bong-da-cau-lac-bo', 'BD-CLB', 4, fixedPrice(139000, null)),
  shirt('ao-cau-long', 'CL', 4, fixedPrice(139000, null)),
  shirt('ao-pickleball', 'PB', 4, fixedPrice(139000, null)),
  shirt('ao-bong-chuyen', 'BC', 4, fixedPrice(139000, null)),
  shirt('ao-bong-ro', 'BR', 4, fixedPrice(169000, 189000)),
  shirt('ao-polo', 'PL', 4, fixedPrice(139000, null)),
  accessory('giay', 'GI', 590000, 100000),
  accessory('bong', 'BO', 290000, 60000),
  accessory('gang-tay', 'GT', 120000, 30000),
  accessory('tat', 'TA', 45000, 10000),
]

function slugify(input: string): string {
  return normalizeText(input).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function categoryName(slug: string): string {
  const category = CATEGORIES.find((c) => c.slug === slug)
  if (!category) throw new Error(`Unknown category: ${slug}`)
  return category.name
}

function buildColors(slug: string, count: number): readonly ProductColor[] {
  return COLOR_NAMES.slice(0, count).map((name, n) => ({
    name,
    image: `https://picsum.photos/seed/${slug}-${n + 1}/800/800`,
  }))
}

function buildProduct(spec: Spec, index: number, globalIndex: number): Product {
  const name = `${categoryName(spec.categorySlug)} ${DESIGN_NAMES[index % DESIGN_NAMES.length]}`
  const slug = slugify(name)
  const sku = `VS-${spec.prefix}-${String(index + 1).padStart(2, '0')}`
  const { price, compareAtPrice } = spec.prices(index)
  return {
    id: sku,
    slug,
    sku,
    name,
    categorySlug: spec.categorySlug,
    kind: spec.kind,
    price,
    compareAtPrice,
    colors: buildColors(slug, spec.colorCount),
    sizes: spec.sizes,
    highlights: [
      'Chất liệu thoáng khí, nhanh khô',
      'Đường may chắc chắn, bền màu sau nhiều lần giặt',
      spec.kind === 'custom' ? 'Nhận in tên, số và logo theo yêu cầu' : 'Có sẵn hàng, giao nhanh toàn quốc',
    ],
    description: `${name} là sản phẩm mẫu của Vertex Sport, chú trọng sự thoải mái và độ bền khi vận động hằng ngày.`,
    createdAt: new Date(BASE_DATE - globalIndex * DAY_MS).toISOString(),
    popularity: ((globalIndex * 37 + 11) % 100) + 1,
  }
}

function buildAll(): readonly Product[] {
  let globalIndex = 0
  const products: Product[] = []
  for (const spec of SPECS) {
    for (let i = 0; i < spec.count; i += 1) {
      products.push(Object.freeze(buildProduct(spec, i, globalIndex)))
      globalIndex += 1
    }
  }
  return Object.freeze(products)
}

export const PRODUCTS: readonly Product[] = buildAll()
