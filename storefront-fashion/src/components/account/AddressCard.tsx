'use client'

import { useState } from 'react'
import type { Address } from '@/lib/addresses/schema'

const ACTION =
  'text-sm font-semibold text-brand-strong underline underline-offset-2 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:opacity-50'

interface AddressCardProps {
  readonly address: Address
  readonly busy: boolean
  readonly onEdit: () => void
  readonly onDelete: () => void
  readonly onMakeDefault: () => void
}

function DeleteConfirm({ busy, onConfirm, onCancel }: { readonly busy: boolean; readonly onConfirm: () => void; readonly onCancel: () => void }) {
  return (
    <div role="group" aria-label="Xác nhận xoá" className="flex flex-wrap items-center gap-3 rounded-xl bg-soft px-3 py-2 text-sm text-ink">
      <span>Xoá địa chỉ này?</span>
      <button type="button" onClick={onConfirm} disabled={busy} className={`${ACTION} text-price`}>
        Xoá
      </button>
      <button type="button" onClick={onCancel} disabled={busy} className={ACTION}>
        Không
      </button>
    </div>
  )
}

export function AddressCard({ address, busy, onEdit, onDelete, onMakeDefault }: AddressCardProps) {
  const [confirming, setConfirming] = useState(false)
  return (
    <article aria-label={address.recipient} className="flex min-w-0 flex-col gap-3 rounded-card border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="break-words font-bold text-ink">{address.recipient}</h2>
        {address.isDefault ? <span className="rounded-full bg-brand px-3 py-0.5 text-xs font-bold uppercase text-brand-ink">Mặc định</span> : null}
      </div>
      <p className="text-sm text-muted">{address.phone}</p>
      <p className="break-words text-sm text-ink">
        {address.address}, {address.province}
      </p>
      {confirming ? (
        <DeleteConfirm busy={busy} onConfirm={onDelete} onCancel={() => setConfirming(false)} />
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <button type="button" onClick={onEdit} disabled={busy} className={ACTION}>
            Sửa
          </button>
          <button type="button" onClick={() => setConfirming(true)} disabled={busy} className={ACTION}>
            Xoá
          </button>
          {address.isDefault ? null : (
            <button type="button" onClick={onMakeDefault} disabled={busy} className={ACTION}>
              Đặt làm mặc định
            </button>
          )}
        </div>
      )}
    </article>
  )
}
