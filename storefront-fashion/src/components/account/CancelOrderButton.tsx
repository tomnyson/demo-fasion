'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { postJson } from '@/lib/http/client'

const ACTION =
  'text-sm font-semibold underline underline-offset-2 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong disabled:opacity-50'

/** "Huỷ đơn" with an inline confirmation; refreshes the page once the server has cancelled the order. */
export function CancelOrderButton({ code }: { readonly code: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancel() {
    setPending(true)
    setError(null)
    const response = await postJson<{ code: string }>(`/api/account/orders/${encodeURIComponent(code)}/cancel`, undefined)
    setPending(false)
    setConfirming(false)
    if (response.success) {
      router.refresh()
      return
    }
    setError(response.error.message)
  }

  return (
    <div className="flex flex-col gap-2">
      {confirming ? (
        <div role="group" aria-label="Xác nhận huỷ đơn" className="flex flex-wrap items-center gap-3 rounded-xl bg-soft px-3 py-2 text-sm text-ink">
          <span>Bạn chắc chắn muốn huỷ đơn này?</span>
          <button type="button" onClick={cancel} disabled={pending} className={`${ACTION} text-price`}>
            {pending ? 'Đang huỷ…' : 'Huỷ đơn'}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className={`${ACTION} text-brand-strong`}>
            Không
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className={`${ACTION} self-start text-price`}>
          Huỷ đơn
        </button>
      )}
      {error === null ? null : (
        <p role="alert" className="text-sm text-price">
          {error}
        </p>
      )}
    </div>
  )
}
