import Image from 'next/image'
import { SectionHead } from '@/components/ui/SectionHead'
import { ABOUT_IMAGE } from '@/config/demo-images'

const BENEFITS = [
  { title: 'Thiết kế miễn phí', text: 'Đội ngũ thiết kế lên mẫu theo màu và ý tưởng của đội bạn.' },
  { title: 'In tên, số, logo', text: 'Công nghệ in bền màu, giữ nét sau nhiều lần giặt.' },
  { title: 'Sản xuất nhanh', text: 'Đơn từ 5 bộ, lịch sản xuất rõ ràng và đúng hẹn.' },
  { title: 'Giao hàng toàn quốc', text: 'Đóng gói cẩn thận, kiểm hàng khi nhận.' },
] as const

export function About() {
  return (
    <section className="bg-soft py-14">
      <div className="container-site grid items-center gap-8 min-[850px]:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card">
          <Image src={ABOUT_IMAGE} alt="Xưởng may đồng phục thể thao của Vertex Sport" fill sizes="(max-width: 849px) 100vw, 560px" className="object-cover" />
        </div>
        <div>
          <SectionHead align="left" kicker="Về Vertex Sport" title="ĐỒNG PHỤC THỂ THAO CHO MỌI ĐỘI NHÓM" subtitle="Chúng tôi giúp đội bóng, trường lớp và doanh nghiệp có bộ đồng phục đúng phong cách, đúng ngân sách." />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((item) => (
              <li key={item.title} className="rounded-product bg-white p-4 shadow-card">
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
