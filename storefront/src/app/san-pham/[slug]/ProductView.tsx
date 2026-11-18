'use client'

import { useState } from 'react'
import { ContactPanel } from '@/components/product/ContactPanel'
import { Gallery } from '@/components/product/Gallery'
import { PurchasePanel } from '@/components/product/PurchasePanel'
import { SizeChartDialog } from '@/components/product/SizeChartDialog'
import { Price } from '@/components/ui/Price'
import type { Product } from '@/lib/catalog/types'

const PERKS = [
  'Miễn phí thiết kế mẫu theo ý tưởng của đội',
  'Miễn phí in tên, số và logo',
  'Giao hàng toàn quốc, nhận hàng kiểm tra rồi thanh toán',
  'Bảo hành sản phẩm theo chính sách của cửa hàng',
] as const

export function ProductView({ product }: { readonly product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0)
  return (
    <div className="grid gap-8 min-[850px]:grid-cols-2">
      <Gallery name={product.name} colors={product.colors} activeIndex={activeIndex} onSelect={setActiveIndex} />
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] font-black leading-tight text-navy">{product.name}</h1>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} kind={product.kind} size="detail" />
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {product.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <div>
          <SizeChartDialog />
        </div>
        {product.kind === 'custom' ? <ContactPanel product={product} /> : <PurchasePanel product={product} activeColorIndex={activeIndex} onColorChange={setActiveIndex} />}
        <section aria-labelledby="perks-title" className="rounded-card border border-line bg-soft p-5">
          <h2 id="perks-title" className="text-base font-black uppercase text-brand">
            ƯU ĐÃI KHI MUA HÀNG
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            {PERKS.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
