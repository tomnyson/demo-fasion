import { MAX_LINE_QTY } from '@/config/commerce'

export interface QuantityStepperProps {
  readonly value: number
  readonly onChange: (value: number) => void
}

const BUTTON =
  'grid h-9 w-9 place-items-center text-lg font-bold text-ink hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand'

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button type="button" aria-label="Giảm số lượng" disabled={value <= 1} onClick={() => onChange(value - 1)} className={BUTTON}>
        <span aria-hidden="true">−</span>
      </button>
      <input
        readOnly
        aria-label="Số lượng"
        value={value}
        className="w-10 bg-transparent text-center text-sm font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-brand"
      />
      <button type="button" aria-label="Tăng số lượng" disabled={value >= MAX_LINE_QTY} onClick={() => onChange(value + 1)} className={BUTTON}>
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}
