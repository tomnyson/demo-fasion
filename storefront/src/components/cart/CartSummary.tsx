import { FREE_SHIP_MIN_ITEMS } from '@/config/commerce'
import { Button } from '@/components/ui/Button'
import { formatVnd } from '@/lib/format'
import type { CartTotals } from '@/lib/cart/totals'

export function CartSummary({ totals }: { readonly totals: CartTotals }) {
  const missing = FREE_SHIP_MIN_ITEMS - totals.itemCount
  return (
    <aside aria-label="Tóm tắt đơn hàng" className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 shadow-card">
      <dl className="space-y-2 text-sm text-ink">
        <div className="flex justify-between">
          <dt>Tạm tính</dt>
          <dd>{formatVnd(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Phí giao hàng</dt>
          <dd>{totals.shipping === 0 ? 'Miễn phí' : formatVnd(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-black text-navy">
          <dt>Tổng cộng</dt>
          <dd data-testid="cart-total" className="text-price">{formatVnd(totals.total)}</dd>
        </div>
      </dl>
      {missing > 0 ? <p className="text-sm text-muted">Mua thêm {missing} sản phẩm để được miễn phí giao hàng.</p> : null}
      <Button variant="red" href="/thanh-toan">
        TIẾN HÀNH THANH TOÁN
      </Button>
    </aside>
  )
}
