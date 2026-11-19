'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MAX_ADDRESSES } from '@/lib/addresses/limits'
import type { AddressBookPayload } from '@/lib/addresses/responses'
import type { Address } from '@/lib/addresses/schema'
import type { ApiResponse } from '@/lib/http/api-response'
import { sendJson } from '@/lib/http/client'
import { AddressCard } from './AddressCard'
import { AddressForm } from './AddressForm'

/** Which form is open: none, the add form, or the edit form of one address. */
type Editing = { readonly kind: 'none' } | { readonly kind: 'new' } | { readonly kind: 'edit'; readonly id: string }
const CLOSED: Editing = { kind: 'none' }

function useAddressActions(initial: readonly Address[]) {
  const [addresses, setAddresses] = useState<readonly Address[]>(initial)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(id: string, request: Promise<ApiResponse<AddressBookPayload>>) {
    setBusyId(id)
    setError(null)
    const response = await request
    if (response.success) setAddresses(response.data.addresses)
    else setError(response.error.message)
    setBusyId(null)
  }

  return {
    addresses,
    setAddresses,
    busyId,
    error,
    remove: (id: string) => run(id, sendJson<AddressBookPayload>('DELETE', `/api/account/addresses/${id}`)),
    makeDefault: (id: string) => run(id, sendJson<AddressBookPayload>('PATCH', `/api/account/addresses/${id}`, { isDefault: true })),
  }
}

export function AddressBook({ initial }: { readonly initial: readonly Address[] }) {
  const { addresses, setAddresses, busyId, error, remove, makeDefault } = useAddressActions(initial)
  const [editing, setEditing] = useState<Editing>(CLOSED)
  const saved = (next: readonly Address[]) => {
    setAddresses(next)
    setEditing(CLOSED)
  }
  const full = addresses.length >= MAX_ADDRESSES
  return (
    <div className="flex flex-col gap-4">
      {error === null ? null : (
        <p role="alert" className="text-sm font-semibold text-price">
          {error}
        </p>
      )}
      {addresses.length === 0 && editing.kind !== 'new' ? <p className="text-sm text-muted">Bạn chưa lưu địa chỉ nào.</p> : null}
      <ul className="grid gap-4 min-[1100px]:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className="min-w-0">
            {editing.kind === 'edit' && editing.id === address.id ? (
              <AddressForm address={address} onSaved={saved} onCancel={() => setEditing(CLOSED)} />
            ) : (
              <AddressCard
                address={address}
                busy={busyId === address.id}
                onEdit={() => setEditing({ kind: 'edit', id: address.id })}
                onDelete={() => remove(address.id)}
                onMakeDefault={() => makeDefault(address.id)}
              />
            )}
          </li>
        ))}
      </ul>
      {editing.kind === 'new' ? (
        <AddressForm onSaved={saved} onCancel={() => setEditing(CLOSED)} />
      ) : full ? (
        <p className="text-sm text-muted">Sổ địa chỉ đã đủ {MAX_ADDRESSES} địa chỉ. Xoá bớt để thêm địa chỉ mới.</p>
      ) : (
        <Button variant="outline" onClick={() => setEditing({ kind: 'new' })} className="self-start">
          + Thêm địa chỉ
        </Button>
      )}
    </div>
  )
}
