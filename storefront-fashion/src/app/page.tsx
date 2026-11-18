import { ProductBlock } from '@/components/home/ProductBlock'

const BLOCKS = [
  { slug: 'ao-bong-da-khong-logo', subtitle: 'Có sẵn, giao nhanh – chọn là mặc được ngay.' },
  { slug: 'ao-bong-da-thiet-ke', subtitle: 'Mẫu thiết kế riêng cho đội bóng của bạn.' },
  { slug: 'ao-cau-long', subtitle: 'Nhẹ, thấm hút tốt cho những pha đập cầu.' },
  { slug: 'ao-pickleball', subtitle: 'Thoải mái, linh hoạt trên mọi mặt sân.' },
  { slug: 'ao-bong-chuyen', subtitle: 'Co giãn bốn chiều, tự tin bật nhảy.' },
  { slug: 'ao-bong-ro', subtitle: 'Form rộng, thoáng mát cho trận đấu cường độ cao.' },
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
