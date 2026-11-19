'use client'

import { useRef, useState, type FormEvent } from 'react'
import type { ApiResponse } from '@/lib/http/api-response'

export type FieldErrors = Readonly<Record<string, string>>

export interface JsonFormState {
  readonly pending: boolean
  readonly errors: FieldErrors
  readonly formError: string | null
  readonly notice: string | null
  readonly handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

interface JsonFormOptions<T> {
  readonly fields: readonly string[]
  readonly send: (values: Readonly<Record<string, string>>) => Promise<ApiResponse<T>>
  readonly onSuccess?: (data: T, form: HTMLFormElement) => void
  readonly successNotice?: string
}

export function readFields(form: HTMLFormElement, fields: readonly string[]): Readonly<Record<string, string>> {
  const data = new FormData(form)
  return Object.fromEntries(fields.map((name) => [name, String(data.get(name) ?? '')]))
}

/** Submit state for small account forms: one request at a time, field errors, form alert and a success notice. */
export function useJsonForm<T>({ fields, send, onSuccess, successNotice }: JsonFormOptions<T>): JsonFormState {
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const inFlight = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    const form = event.currentTarget
    setPending(true)
    setErrors({})
    setFormError(null)
    setNotice(null)
    const response = await send(readFields(form, fields))
    if (response.success) {
      setNotice(successNotice ?? null)
      onSuccess?.(response.data, form)
    } else {
      const fieldErrors = response.error.fields ?? {}
      setErrors(fieldErrors)
      setFormError(Object.keys(fieldErrors).length === 0 ? response.error.message : null)
    }
    setPending(false)
    inFlight.current = false
  }

  return { pending, errors, formError, notice, handleSubmit }
}
