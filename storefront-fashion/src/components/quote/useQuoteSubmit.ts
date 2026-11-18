'use client'

import { useRef, useState, type FormEvent } from 'react'
import { postJson } from '@/lib/http/client'

const GENERIC_ERROR = 'Có lỗi xảy ra. Vui lòng thử lại.'
const QUOTE_FIELDS = ['name', 'phone', 'sport', 'quantity', 'message'] as const

function textOf(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

function buildPayload(form: HTMLFormElement, compact: boolean, productSlug: string | undefined) {
  const data = new FormData(form)
  const names = compact ? QUOTE_FIELDS.filter((name) => name !== 'message') : QUOTE_FIELDS
  const fields = Object.fromEntries(names.map((name) => [name, textOf(data, name)]))
  return productSlug === undefined ? fields : { ...fields, productSlug }
}

function formErrorFor(fields: Readonly<Record<string, string>>, message: string): string | null {
  const hasFieldError = QUOTE_FIELDS.some((name) => name in fields)
  return hasFieldError ? null : message || GENERIC_ERROR
}

export function useQuoteSubmit(compact: boolean, productSlug: string | undefined) {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
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
    const response = await postJson<{ received: true }>('/api/quotes', buildPayload(event.currentTarget, compact, productSlug))
    if (response.success) {
      setSent(true)
      return
    }
    const fields = response.error.fields ?? {}
    setErrors(fields)
    setFormError(formErrorFor(fields, response.error.message))
    setPending(false)
    inFlight.current = false
  }

  return { pending, sent, errors, formError, handleSubmit }
}
