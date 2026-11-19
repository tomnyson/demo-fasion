'use client'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import type { PublicUser } from '@/lib/auth/users'
import { sendJson } from '@/lib/http/client'
import { FormStatus } from './FormStatus'
import { useJsonForm } from './useJsonForm'

const CARD = 'flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card'
const HEADING = 'text-lg font-black uppercase text-ink'

export function ProfileForm({ user }: { readonly user: PublicUser }) {
  const { pending, errors, formError, notice, handleSubmit } = useJsonForm({
    fields: ['name', 'phone'],
    send: (values) => sendJson<{ user: PublicUser }>('PATCH', '/api/account/profile', values),
    successNotice: 'Đã lưu thông tin.',
  })
  return (
    <form noValidate onSubmit={handleSubmit} aria-labelledby="profile-heading" className={CARD}>
      <h2 id="profile-heading" className={HEADING}>
        Thông tin cá nhân
      </h2>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink">Email</span>
        <p className="break-all text-sm text-muted">{user.email}</p>
      </div>
      <FormField idPrefix="profile" name="name" label="Họ và tên" error={errors.name}>
        {(props) => <input type="text" autoComplete="name" defaultValue={user.name} {...props} />}
      </FormField>
      <FormField idPrefix="profile" name="phone" label="Số điện thoại (không bắt buộc)" error={errors.phone}>
        {(props) => <input type="tel" autoComplete="tel" defaultValue={user.phone ?? ''} {...props} />}
      </FormField>
      <FormStatus error={formError} notice={notice} />
      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? 'Đang lưu…' : 'LƯU THAY ĐỔI'}
      </Button>
    </form>
  )
}

export function PasswordForm() {
  const { pending, errors, formError, notice, handleSubmit } = useJsonForm({
    fields: ['currentPassword', 'newPassword'],
    send: (values) => sendJson<{ user: PublicUser }>('POST', '/api/account/password', values),
    onSuccess: (_data, form) => form.reset(),
    successNotice: 'Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.',
  })
  return (
    <form noValidate onSubmit={handleSubmit} aria-labelledby="password-heading" className={CARD}>
      <h2 id="password-heading" className={HEADING}>
        Đổi mật khẩu
      </h2>
      <FormField idPrefix="password" name="currentPassword" label="Mật khẩu hiện tại" error={errors.currentPassword}>
        {(props) => <input type="password" autoComplete="current-password" {...props} />}
      </FormField>
      <FormField idPrefix="password" name="newPassword" label="Mật khẩu mới (8–72 ký tự)" error={errors.newPassword}>
        {(props) => <input type="password" autoComplete="new-password" {...props} />}
      </FormField>
      <FormStatus error={formError} notice={notice} />
      <Button variant="primary" type="submit" disabled={pending}>
        {pending ? 'Đang xử lý…' : 'ĐỔI MẬT KHẨU'}
      </Button>
    </form>
  )
}
