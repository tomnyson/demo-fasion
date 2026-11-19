'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { postJson } from '@/lib/http/client'
import { hardNavigate } from '@/lib/navigation/hard-navigate'

export type AuthMode = 'login' | 'register'

interface FieldSpec {
  readonly name: string
  readonly label: string
  readonly type: 'text' | 'email' | 'tel' | 'password'
  readonly autoComplete: string
}

const FIELDS: Readonly<Record<AuthMode, readonly FieldSpec[]>> = {
  login: [
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'password', label: 'Mật khẩu', type: 'password', autoComplete: 'current-password' },
  ],
  register: [
    { name: 'name', label: 'Họ và tên', type: 'text', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'phone', label: 'Số điện thoại (không bắt buộc)', type: 'tel', autoComplete: 'tel' },
    { name: 'password', label: 'Mật khẩu (8–72 ký tự)', type: 'password', autoComplete: 'new-password' },
  ],
}

const COPY = {
  login: { submit: 'ĐĂNG NHẬP', switchText: 'Chưa có tài khoản?', switchLabel: 'Đăng ký', switchPath: '/dang-ky' },
  register: { submit: 'TẠO TÀI KHOẢN', switchText: 'Đã có tài khoản?', switchLabel: 'Đăng nhập', switchPath: '/dang-nhap' },
} as const

type FieldErrors = Readonly<Record<string, string>>

function valuesOf(form: HTMLFormElement, fields: readonly FieldSpec[]): Record<string, string> {
  const data = new FormData(form)
  return Object.fromEntries(fields.map(({ name }) => [name, String(data.get(name) ?? '')]))
}

function useAuthSubmit(mode: AuthMode, next: string) {
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const inFlight = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setErrors({})
    setFormError(null)
    const response = await postJson<{ user: unknown }>(`/api/auth/${mode}`, valuesOf(event.currentTarget, FIELDS[mode]))
    if (response.success) {
      hardNavigate(next)
      return
    }
    const fields = response.error.fields ?? {}
    setErrors(fields)
    setFormError(Object.keys(fields).length === 0 ? response.error.message : null)
    setPending(false)
    inFlight.current = false
  }

  return { pending, errors, formError, handleSubmit }
}

interface AuthFormProps {
  readonly mode: AuthMode
  /** Already sanitised with `safeNext` on the server. */
  readonly next: string
}

export function AuthForm({ mode, next }: AuthFormProps) {
  const { pending, errors, formError, handleSubmit } = useAuthSubmit(mode, next)
  const copy = COPY[mode]
  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card">
      {FIELDS[mode].map((field) => (
        <FormField key={field.name} idPrefix={mode} name={field.name} label={field.label} error={errors[field.name]}>
          {(props) => <input type={field.type} autoComplete={field.autoComplete} {...props} />}
        </FormField>
      ))}
      {formError === null ? null : (
        <p role="alert" className="text-sm font-semibold text-price">
          {formError}
        </p>
      )}
      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? 'Đang xử lý…' : copy.submit}
      </Button>
      <p className="text-center text-sm text-muted">
        {copy.switchText}{' '}
        <Link href={`${copy.switchPath}?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-strong underline underline-offset-2">
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  )
}
