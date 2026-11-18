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
        <Button variant="soft" href="/danh-muc/ao">
          TIẾP TỤC MUA SẮM
        </Button>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 items-start gap-6 min-[850px]:grid-cols-[minmax(0,1fr)_340px]">
      <CartTable lines={totals.lines} onQuantity={setQuantity} onRemove={remove} />
      <CartSummary totals={totals} />
    </div>
  )
}
