'use client'

import { useCart } from '@/components/cart/CartProvider'
import { CartSummary } from '@/components/cart/CartSummary'
import { CartTable } from '@/components/cart/CartTable'
import { Button } from '@/components/ui/Button'

export function CartView() {
  const { totals, hydrated, setQuantity, remove } = useCart()
  if (!hydrated) return <div className="min-h-64" aria-busy="true" />
  if (totals.lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-ink">Giỏ hàng của bạn đang trống.</p>
        <Button variant="blue" href="/danh-muc/ao-bong-da-khong-logo">
          TIẾP TỤC MUA SẮM
        </Button>
      </div>
    )
  }
  return (
    <div className="grid items-start gap-6 min-[850px]:grid-cols-[1fr_340px]">
      <CartTable lines={totals.lines} onQuantity={setQuantity} onRemove={remove} />
      <CartSummary totals={totals} />
    </div>
  )
}
