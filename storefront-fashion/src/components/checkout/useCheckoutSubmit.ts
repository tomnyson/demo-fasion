'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, type FormEvent } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { postJson } from '@/lib/http/client'

const CUSTOMER_FIELDS = ['name', 'phone', 'email', 'province', 'address', 'note'] as const
const GENERIC_ERROR = 'Có lỗi xảy ra. Vui lòng thử lại.'

function textOf(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

/** Saved address: only email and note travel; the server copies the recipient from the book. */
function buildPayload(form: HTMLFormElement, lines: readonly unknown[]) {
  const data = new FormData(form)
  const common = { payment: textOf(data, 'payment'), lines, couponCode: textOf(data, 'couponCode') }
  const addressId = textOf(data, 'addressId')
  if (addressId !== '') return { addressId, customer: { email: textOf(data, 'email'), note: textOf(data, 'note') }, ...common }
  const customer = Object.fromEntries(CUSTOMER_FIELDS.map((name) => [name, textOf(data, name)]))
  return { customer, ...common, ...(data.get('saveAddress') === 'on' ? { saveAddress: true } : {}) }
}

function formErrorFor(fields: Readonly<Record<string, string>>, message: string): string | null {
  const hasFieldError = Object.keys(fields).some((key) => key.startsWith('customer.') || key === 'couponCode' || key === 'addressId')
  return fields.lines ?? (hasFieldError ? null : message || GENERIC_ERROR)
}

interface CheckoutSubmitOptions {
  /** Called with the message when the order API refuses the coupon code. */
  readonly onCouponRejected?: (message: string) => void
}

export function useCheckoutSubmit({ onCouponRejected }: CheckoutSubmitOptions = {}) {
  const router = useRouter()
  const { lines, clear } = useCart()
  const [pending, setPending] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [errors, setErrors] = useState<Readonly<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const inFlight = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setErrors({})
    setFormError(null)
    const response = await postJson<{ code: string }>('/api/orders', buildPayload(event.currentTarget, lines))
    if (response.success) {
      setPlaced(true)
      clear()
      router.replace(`/dat-hang-thanh-cong/${response.data.code}`)
      return
    }
    const fields = response.error.fields ?? {}
    if (fields.couponCode !== undefined) onCouponRejected?.(fields.couponCode)
    setErrors(fields)
    setFormError(formErrorFor(fields, response.error.message))
    setPending(false)
    inFlight.current = false
  }

  return { pending, placed, errors, formError, handleSubmit }
}
