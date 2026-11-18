import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SITE } from '@/config/site'
import type { Product } from '@/lib/catalog/types'

export function ContactPanel({ product }: { readonly product: Product }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">Sản phẩm may theo yêu cầu. Liên hệ để được tư vấn mẫu, size và số lượng.</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="red" href={SITE.hotlineTel}>
          LIÊN HỆ ĐẶT HÀNG
        </Button>
        <Button variant="blue" href={SITE.zaloUrl}>
          TƯ VẤN THIẾT KẾ
        </Button>
      </div>
      <Link href={`/bao-gia?san-pham=${product.slug}`} className="text-sm font-semibold text-brand underline underline-offset-2">
        Nhận báo giá cho mẫu này
      </Link>
    </div>
  )
}
