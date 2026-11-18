import { Button } from '@/components/ui/Button'

export interface PurchaseActionsProps {
  readonly added: boolean
  readonly onAdd: () => void
  readonly onBuyNow: () => void
}

export function PurchaseActions({ added, onAdd, onBuyNow }: PurchaseActionsProps) {
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={onAdd}>
          THÊM VÀO GIỎ
        </Button>
        <Button variant="soft" onClick={onBuyNow}>
          MUA NGAY
        </Button>
      </div>
      <p aria-live="polite" className="min-h-5 text-sm font-semibold text-brand-strong">
        {added ? 'Đã thêm vào giỏ hàng' : ''}
      </p>
    </>
  )
}
