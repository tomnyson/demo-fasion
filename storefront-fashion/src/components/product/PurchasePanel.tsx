'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { PurchaseActions } from './PurchaseActions'
import { ColorFieldset, SizeFieldset } from './ChoiceFieldsets'
import type { Product, Size } from '@/lib/catalog/types'

export interface PurchasePanelProps {
  readonly product: Product
  readonly activeColorIndex: number
  readonly onColorChange: (index: number) => void
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
      <ColorFieldset
        product={product}
        color={color}
        activeColorIndex={activeColorIndex}
        onSelect={(index) => { onColorChange(index); setAdded(false) }}
      />
      <SizeFieldset product={product} size={size} showError={sizeError} onSelect={selectSize} />
      <div>
        <span className="mb-2 block text-sm font-bold text-ink">Số lượng</span>
        <QuantityStepper value={quantity} onChange={(next) => { setQuantity(next); setAdded(false) }} />
      </div>
      <PurchaseActions
        added={added}
        onAdd={() => setAdded(commit())}
        onBuyNow={() => { if (commit()) router.push('/thanh-toan') }}
      />
    </div>
  )
}
