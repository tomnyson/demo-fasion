'use client'

import Image from 'next/image'
import Link from 'next/link'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatVnd } from '@/lib/format'
import type { PricedLine } from '@/lib/cart/totals'

export interface CartTableProps {
  readonly lines: readonly PricedLine[]
  readonly onQuantity: (key: string, quantity: number) => void
  readonly onRemove: (key: string) => void
}

export function CartTable({ lines, onQuantity, onRemove }: CartTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-soft text-xs font-bold uppercase text-muted">
          <tr>
            <th scope="col" className="p-3">Sản phẩm</th>
            <th scope="col" className="p-3">Màu</th>
            <th scope="col" className="p-3">Size</th>
            <th scope="col" className="p-3">Đơn giá</th>
            <th scope="col" className="p-3">Số lượng</th>
            <th scope="col" className="p-3">Thành tiền</th>
            <th scope="col" className="p-3"><span className="sr-only">Thao tác</span></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const image = (line.product.colors.find((c) => c.name === line.color) ?? line.product.colors[0]).image
            return (
              <tr key={line.key} className="border-t border-line align-middle">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-product bg-soft">
                      <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <Link href={`/san-pham/${line.product.slug}`} className="font-bold text-navy hover:text-brand">
                      {line.product.name}
                    </Link>
                  </div>
                </td>
                <td className="p-3">{line.color}</td>
                <td className="p-3">{line.size}</td>
                <td className="p-3">{formatVnd(line.product.price)}</td>
                <td className="p-3">
                  <QuantityStepper value={line.quantity} onChange={(next) => onQuantity(line.key, next)} />
                </td>
                <td className="p-3 font-bold text-price">{formatVnd(line.lineTotal)}</td>
                <td className="p-3">
                  <button type="button" onClick={() => onRemove(line.key)} className="font-semibold text-muted underline underline-offset-2 hover:text-accent">
                    Xoá
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
