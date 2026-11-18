import { ProductBlock } from '@/components/home/ProductBlock'

const BLOCKS = [
  { slug: 'dam', subtitle: 'Dáng đầm nhẹ nhàng cho công sở và dạo phố.' },
  { slug: 'vay', subtitle: 'Chân váy dễ phối, mặc cả ngày vẫn thoải mái.' },
  { slug: 'ao', subtitle: 'Áo mềm mịn, form đẹp, hợp mọi vóc dáng.' },
  { slug: 'quan', subtitle: 'Quần cạp cao tôn dáng, thoáng mát khi di chuyển.' },
] as const

export default function Home() {
  return (
    <div id="san-pham" className="scroll-mt-24 bg-soft py-14">
      <div className="container-site flex flex-col gap-8">
        {BLOCKS.map((block) => (
          <ProductBlock key={block.slug} categorySlug={block.slug} subtitle={block.subtitle} />
        ))}
      </div>
    </div>
  )
}
