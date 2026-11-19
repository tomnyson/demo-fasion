'use client'

import { useState } from 'react'
import type { Address } from '@/lib/addresses/schema'
import { AddressPicker, OTHER_ADDRESS } from './AddressPicker'
import { RecipientFields } from './RecipientFields'

/** What the checkout knows about a signed-in customer; absent for guests. */
export interface CheckoutAccount {
  readonly addresses: readonly Address[]
}

interface CheckoutRecipientProps {
  readonly account?: CheckoutAccount
  readonly errors: Readonly<Record<string, string>>
}

function SaveAddressCheckbox() {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" name="saveAddress" />
      Lưu vào sổ địa chỉ
    </label>
  )
}

const defaultChoice = (addresses: readonly Address[]): string => (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? OTHER_ADDRESS

/**
 * Guests type the recipient. Signed-in customers pick a saved address (the default is preselected) or
 * type a new one, which they may keep in their address book.
 */
export function CheckoutRecipient({ account, errors }: CheckoutRecipientProps) {
  const [selected, setSelected] = useState(() => defaultChoice(account?.addresses ?? []))
  if (account === undefined) return <RecipientFields errors={errors} />
  const typing = selected === OTHER_ADDRESS
  return (
    <>
      {account.addresses.length === 0 ? null : (
        <AddressPicker addresses={account.addresses} selected={selected} onSelect={setSelected} error={errors.addressId} />
      )}
      {typing ? <RecipientFields errors={errors} afterAddress={<SaveAddressCheckbox />} /> : <RecipientFields errors={errors} shipping={false} />}
    </>
  )
}
