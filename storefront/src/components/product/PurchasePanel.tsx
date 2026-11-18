'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import type { Product, Size } from '@/lib/catalog/types'

export interface PurchasePanelProps {
  readonly product: Product
  readonly activeColorIndex: number
  readonly onColorChange: (index: number) => void
}

const CHOICE =
  'inline-flex cursor-pointer items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand'

function Choice({ name, value, label, checked, onSelect }: { readonly name: string; readonly value: string; readonly label: string; readonly checked: boolean; readonly onSelect: () => void }) {
  return (
    <label className="relative">
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
      <span className={CHOICE}>{label}</span>
    </label>
  )
}

export function PurchasePanel({ product, activeColorIndex, onColorChange }: PurchasePanelProps) {
  const router = useRouter()
  const { add } = useCart()
  const [size, setSize] = useState<Size | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [added, setAdded] = useState(false)
  const color = product.colors[activeColorIndex] ?? product.colors[0]

  function commit(): boolean {
    if (size === null || color === undefined) {
      setSizeError(true)
      setAdded(false)
      return false
    }
    add({ productId: product.id, size, color: color.name, quantity })
    setSizeError(false)
    return true
  }

  function selectSize(next: Size) {
    setSize(next)
    setSizeError(false)
    setAdded(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-navy">Màu sắc: {color?.name}</legend>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c, index) => (
            <Choice key={c.name} name={`color-${product.id}`} value={c.name} label={c.name} checked={index === activeColorIndex} onSelect={() => { onColorChange(index); setAdded(false) }} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-navy">Size</legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <Choice key={s} name={`size-${product.id}`} value={s} label={s} checked={size === s} onSelect={() => selectSize(s)} />
          ))}
        </div>
        {sizeError ? (
          <p role="alert" className="mt-2 text-sm font-semibold text-accent">
            Vui lòng chọn size.
          </p>
        ) : null}
      </fieldset>
      <div>
        <span className="mb-2 block text-sm font-bold text-navy">Số lượng</span>
        <QuantityStepper value={quantity} onChange={(next) => { setQuantity(next); setAdded(false) }} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="red" onClick={() => setAdded(commit())}>
          THÊM VÀO GIỎ
        </Button>
        <Button variant="blue" onClick={() => { if (commit()) router.push('/thanh-toan') }}>
          MUA NGAY
        </Button>
      </div>
      <p aria-live="polite" className="min-h-5 text-sm font-semibold text-brand">
        {added ? 'Đã thêm vào giỏ hàng' : ''}
      </p>
    </div>
  )
}
