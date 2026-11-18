import { normalizeText } from '../text'
import type { Product, ProductColor, ProductTag, Size } from './types'

const SIZES: readonly Size[] = ['S', 'M', 'L', 'XL', 'XXL']
const COLOR_NAMES = ['Trắng kem', 'Đen', 'Xanh rêu', 'Hồng phấn', 'Nâu be'] as const
const BASE_DATE = Date.UTC(2026, 10, 1)
const DAY_MS = 86_400_000
const PER_CATEGORY = 12
const SALE_MARKUP = 60000

interface Spec {
  readonly categorySlug: string
  readonly prefix: string
  readonly noun: string
  readonly basePrice: number
  readonly priceStep: number
  readonly names: readonly string[]
  readonly highlights: readonly string[]
}

const SPECS: readonly Spec[] = [
  {
    categorySlug: 'dam', prefix: 'DA', noun: 'đầm', basePrice: 339000, priceStep: 10000,
    names: [
      'Đầm suông cổ vuông Mộc', 'Đầm xòe tay phồng Lúa', 'Đầm bodycon cổ tròn Sương', 'Đầm sơ mi thắt eo Hạ',
      'Đầm wrap hoa nhí Thu', 'Đầm maxi dáng dài Biển', 'Đầm babydoll nơ vai Mây', 'Đầm công sở cổ sen Lam',
      'Đầm liền hai dây Nắng', 'Đầm peplum tay lỡ Quế', 'Đầm trễ vai cổ thuyền Tơ', 'Đầm A-line phối cúc Gấm',
    ],
    highlights: [
      'Vải mềm, rủ nhẹ, tạo dáng thanh thoát',
      'Form ôm vừa phải, tôn đường eo',
      'Lót mỏng bên trong, không lộ khi di chuyển',
      'Mặc đi làm, đi chơi hay dạo phố đều hợp',
    ],
  },
  {
    categorySlug: 'vay', prefix: 'VA', noun: 'váy', basePrice: 259000, priceStep: 9000,
    names: [
      'Váy chữ A lưng cao Trà', 'Váy xếp ly dáng dài Liễu', 'Váy bút chì xẻ tà Sen', 'Váy midi xòe họa tiết Cúc',
      'Váy jean ngắn túi hộp Gió', 'Váy tennis xếp ly Lan', 'Váy lụa satin ôm hông Nguyệt', 'Váy tầng bồng bềnh Hồng',
      'Váy quấn eo thắt nơ Đào', 'Váy len dệt kim Tuyết', 'Váy ren hai lớp Sao', 'Váy kaki cạp chun Cau',
    ],
    highlights: [
      'Cạp vừa vặn, có lớp lót mềm bên trong',
      'Chân váy đứng form, ít nhăn khi ngồi lâu',
      'Độ dài hợp dáng người Việt, dễ phối giày',
      'Chất vải thoáng, mặc cả ngày không bí',
    ],
  },
  {
    categorySlug: 'ao', prefix: 'AO', noun: 'áo', basePrice: 229000, priceStep: 5000,
    names: [
      'Áo sơ mi lụa cổ đức Mơ', 'Áo thun cotton cổ tròn Nhài', 'Áo kiểu tay bồng Hương', 'Áo croptop dệt gân Khói',
      'Áo blazer dáng rộng Bạc Hà', 'Áo len mỏng cổ lọ Trầm', 'Áo polo viền bo Chanh', 'Áo hai dây lụa Cà Phê',
      'Áo cardigan cúc ngọc Sữa', 'Áo vest ngắn vai độn Mực', 'Áo peplum cổ vuông Lài', 'Áo khoác gió mỏng Tre',
    ],
    highlights: [
      'Chất liệu mềm mịn, thấm hút tốt',
      'Đường may tỉ mỉ, giữ form sau nhiều lần giặt',
      'Dễ phối cùng chân váy hoặc quần ống rộng',
      'Màu bền, không phai khi giặt đúng cách',
    ],
  },
  {
    categorySlug: 'quan', prefix: 'QU', noun: 'quần', basePrice: 289000, priceStep: 8000,
    names: [
      'Quần ống rộng lưng cao Tre', 'Quần culottes linen Nâu', 'Quần tây ống suông Mực', 'Quần jean ống loe Chàm',
      'Quần short kaki cạp chun Quất', 'Quần baggy túi hộp Rêu', 'Quần legging nâng mông Mận', 'Quần yếm denim Tía',
      'Quần ống đứng xếp ly Gạo', 'Quần jogger lụa Cacao', 'Quần tây lửng cạp cao Hạnh', 'Quần giả váy xếp tầng Cúc',
    ],
    highlights: [
      'Cạp cao tôn dáng, co giãn nhẹ dễ vận động',
      'Ống quần đứng form, che khuyết điểm tốt',
      'Vải dày vừa phải, không lộ đường may',
      'Có túi thật tiện lợi khi đi làm, đi chơi',
    ],
  },
]

function slugify(input: string): string {
  return normalizeText(input).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function tagsFor(index: number): readonly ProductTag[] {
  if (index <= 2) return ['featured']
  if (index <= 5) return ['best-seller']
  if (index <= 8) return ['new']
  return []
}

function buildColors(slug: string, count: number): readonly ProductColor[] {
  return COLOR_NAMES.slice(0, count).map((name, n) => ({
    name,
    image: `https://picsum.photos/seed/${slug}-${n + 1}/900/1200`,
  }))
}

function buildProduct(spec: Spec, index: number, globalIndex: number): Product {
  const name = spec.names[index]
  const slug = slugify(name)
  const sku = `LS-${spec.prefix}-${String(index + 1).padStart(2, '0')}`
  const price = spec.basePrice + spec.priceStep * index
  const onSale = index % 3 === 0
  return {
    id: sku,
    slug,
    sku,
    name,
    categorySlug: spec.categorySlug,
    price,
    compareAtPrice: onSale ? price + SALE_MARKUP : null,
    colors: buildColors(slug, 3 + (index % 3)),
    sizes: SIZES,
    tags: Object.freeze(tagsFor(index)),
    highlights: spec.highlights,
    description: `${name} là mẫu ${spec.noun} thuộc bộ sưu tập mẫu của Lá Studio. Thiết kế nhẹ nhàng, chất liệu dễ chịu và đường may gọn gàng, phù hợp để mặc hằng ngày. Hãy xem bảng size và chọn theo số đo ngực, eo, mông của bạn để có form vừa vặn nhất.`,
    createdAt: new Date(BASE_DATE - globalIndex * DAY_MS).toISOString(),
    popularity: ((globalIndex * 37 + 11) % 100) + 1,
  }
}

function buildAll(): readonly Product[] {
  const products: Product[] = []
  SPECS.forEach((spec, specIndex) => {
    for (let i = 0; i < PER_CATEGORY; i += 1) {
      products.push(Object.freeze(buildProduct(spec, i, specIndex * PER_CATEGORY + i)))
    }
  })
  return Object.freeze(products)
}

export const PRODUCTS: readonly Product[] = buildAll()
