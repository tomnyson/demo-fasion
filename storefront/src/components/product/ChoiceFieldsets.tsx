import type { Product, ProductColor, Size } from '@/lib/catalog/types'

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

export interface ColorFieldsetProps {
  readonly product: Product
  readonly color: ProductColor | undefined
  readonly activeColorIndex: number
  readonly onSelect: (index: number) => void
}

export function ColorFieldset({ product, color, activeColorIndex, onSelect }: ColorFieldsetProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-navy">Màu sắc: {color?.name}</legend>
      <div className="flex flex-wrap gap-2">
        {product.colors.map((c, index) => (
          <Choice key={c.name} name={`color-${product.id}`} value={c.name} label={c.name} checked={index === activeColorIndex} onSelect={() => onSelect(index)} />
        ))}
      </div>
    </fieldset>
  )
}

export interface SizeFieldsetProps {
  readonly product: Product
  readonly size: Size | null
  readonly showError: boolean
  readonly onSelect: (size: Size) => void
}

export function SizeFieldset({ product, size, showError, onSelect }: SizeFieldsetProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-navy">Size</legend>
      <div className="flex flex-wrap gap-2">
        {product.sizes.map((s) => (
          <Choice key={s} name={`size-${product.id}`} value={s} label={s} checked={size === s} onSelect={() => onSelect(s)} />
        ))}
      </div>
      {showError ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-accent">
          Vui lòng chọn size.
        </p>
      ) : null}
    </fieldset>
  )
}
