import Image from 'next/image'
import { Button } from '@/components/ui/Button'

const POINTS = ['Từ 5 bộ', 'Thiết kế miễn phí', 'In tên số logo', 'Sản xuất nhanh'] as const

export function Hero() {
  return (
    <section className="container-site pt-4">
      <div
        className="grid items-center gap-8 rounded-card bg-hero px-6 pb-24 pt-10 text-white min-[850px]:grid-cols-2 min-[850px]:px-12 min-[850px]:pb-28 min-[850px]:pt-14"
      >
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-white/80">Đồng phục đội nhóm · Trường lớp · Doanh nghiệp</p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-tight min-[850px]:text-5xl">
            <span className="block">ĐỒ THỂ THAO</span>
            <span className="block text-brand">THIẾT KẾ THEO YÊU CẦU</span>
            <span className="block">CHO ĐỘI NHÓM</span>
          </h1>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-medium">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="red" href="/bao-gia">NHẬN THIẾT KẾ MIỄN PHÍ</Button>
            <Button variant="white" href="#san-pham">XEM MẪU ÁO</Button>
          </div>
          <p className="mt-5 text-sm text-white/80">500+ đội nhóm đã tin tưởng</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-card">
          <Image
            src="https://picsum.photos/seed/vertex-hero/960/720"
            alt="Đội nhóm mặc đồng phục thể thao thiết kế riêng"
            fill
            priority
            sizes="(max-width: 849px) 100vw, 540px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
