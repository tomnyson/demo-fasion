import type { Address } from '@/lib/addresses/schema'

/** Radio value for "ship somewhere else"; the form then shows the recipient fields. */
export const OTHER_ADDRESS = ''

interface AddressPickerProps {
  readonly addresses: readonly Address[]
  readonly selected: string
  readonly onSelect: (id: string) => void
  readonly error?: string
}

const ERROR_ID = 'checkout-addressId-error'
const OPTION =
  'flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 text-sm text-ink has-[:checked]:border-brand-strong has-[:checked]:bg-soft'

function AddressOption({ address, checked, onSelect }: { readonly address: Address; readonly checked: boolean; readonly onSelect: (id: string) => void }) {
  return (
    <label className={OPTION}>
      <input type="radio" name="addressId" value={address.id} checked={checked} onChange={() => onSelect(address.id)} className="mt-1" />
      <span className="min-w-0 break-words">
        <span className="font-bold">{address.recipient}</span>
        {address.isDefault ? <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold uppercase text-brand-ink">Mặc định</span> : null}
        <span className="block text-muted">{address.phone}</span>
        <span className="block">
          {address.address}, {address.province}
        </span>
      </span>
    </label>
  )
}

/** Saved addresses for a signed-in customer, plus "Giao tới địa chỉ khác". */
export function AddressPicker({ addresses, selected, onSelect, error }: AddressPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error === undefined ? undefined : ERROR_ID}>
      <legend className="mb-1 text-sm font-semibold text-ink">Địa chỉ giao hàng</legend>
      {addresses.map((address) => (
        <AddressOption key={address.id} address={address} checked={selected === address.id} onSelect={onSelect} />
      ))}
      <label className={OPTION}>
        <input type="radio" name="addressId" value={OTHER_ADDRESS} checked={selected === OTHER_ADDRESS} onChange={() => onSelect(OTHER_ADDRESS)} />
        Giao tới địa chỉ khác
      </label>
      {error === undefined ? null : (
        <p id={ERROR_ID} role="alert" className="text-sm text-price">
          {error}
        </p>
      )}
    </fieldset>
  )
}
