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

function buildPayload(form: HTMLFormElement, lines: readonly unknown[]) {
  const data = new FormData(form)
  const customer = Object.fromEntries(CUSTOMER_FIELDS.map((name) => [name, textOf(data, name)]))
  return { customer, payment: textOf(data, 'payment'), lines }
}

function formErrorFor(fields: Readonly<Record<string, string>>, message: string): string | null {
  const hasFieldError = Object.keys(fields).some((key) => key.startsWith('customer.'))
  return fields.lines ?? (hasFieldError ? null : message || GENERIC_ERROR)
}

export function useCheckoutSubmit() {
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
    setErrors(fields)
    setFormError(formErrorFor(fields, response.error.message))
    setPending(false)
    inFlight.current = false
  }

  return { pending, placed, errors, formError, handleSubmit }
}
