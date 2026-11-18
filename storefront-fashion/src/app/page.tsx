import { About } from '@/components/home/About'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { Hero } from '@/components/home/Hero'
import { Process } from '@/components/home/Process'
import { ProductBlock } from '@/components/home/ProductBlock'
import { Projects } from '@/components/home/Projects'
import { PromoBanners } from '@/components/home/PromoBanners'
import { TrustStrip } from '@/components/home/TrustStrip'

const BLOCKS = [
  { slug: 'ao-bong-da-khong-logo', subtitle: 'Có sẵn, giao nhanh – chọn là mặc được ngay.' },
  { slug: 'ao-bong-da-thiet-ke', subtitle: 'Mẫu thiết kế riêng cho đội bóng của bạn.' },
  { slug: 'ao-cau-long', subtitle: 'Nhẹ, thấm hút tốt cho những pha đập cầu.' },
  { slug: 'ao-pickleball', subtitle: 'Thoải mái, linh hoạt trên mọi mặt sân.' },
  { slug: 'ao-bong-chuyen', subtitle: 'Co giãn bốn chiều, tự tin bật nhảy.' },
  { slug: 'ao-bong-ro', subtitle: 'Form rộng, thoáng mát cho trận đấu cường độ cao.' },
] as const

const PROMO_AFTER_INDEX = 1

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryTiles />
      <About />
      <Process />
      <div id="san-pham" className="scroll-mt-24 bg-soft py-14">
        <div className="container-site flex flex-col gap-8">
          {BLOCKS.map((block, index) => (
            <div key={block.slug} className="flex flex-col gap-8">
              <ProductBlock categorySlug={block.slug} subtitle={block.subtitle} />
              {index === PROMO_AFTER_INDEX ? <PromoBanners /> : null}
            </div>
          ))}
        </div>
      </div>
      <Projects />
    </>
  )
}
