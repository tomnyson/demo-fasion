import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SITE } from '@/config/site'

export const metadata: Metadata = { title: 'Giới thiệu' }

export default function AboutPage() {
  return (
    <div className="container-site py-8">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giới thiệu' }]} />
      <h1 className="mt-4 text-[30px] font-black leading-tight text-ink">Giới thiệu {SITE.name}</h1>
      <div className="mt-6 max-w-[760px] space-y-4 leading-relaxed text-ink">
        <p>
          {SITE.name} là cửa hàng thời trang nữ với những thiết kế may sẵn dành cho nhịp sống hằng ngày: đi làm, đi chơi hay dạo phố cuối tuần. Chúng tôi chọn form dáng gọn gàng, chất liệu thoáng và gam màu dễ phối.
        </p>
        <p>
          Mỗi sản phẩm có đủ size từ S đến XXL kèm bảng số đo rõ ràng để bạn tự tin chọn size khi mua online. Bạn thêm sản phẩm vào giỏ hàng, thanh toán khi nhận hàng hoặc chuyển khoản.
        </p>
        <p>
          Chúng tôi mong bạn mặc đẹp một cách thoải mái. Nếu cần tư vấn, hãy gọi hotline {SITE.hotlineDisplay} hoặc nhắn qua Zalo, Messenger; đội ngũ luôn sẵn sàng hỗ trợ.
        </p>
      </div>
    </div>
  )
}
