'use client'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { PROVINCES } from '@/config/provinces'
import type { AddressBookPayload } from '@/lib/addresses/responses'
import type { Address } from '@/lib/addresses/schema'
import { sendJson } from '@/lib/http/client'
import { FormStatus } from './FormStatus'
import { useJsonForm } from './useJsonForm'

const FIELDS = ['recipient', 'phone', 'province', 'address'] as const

interface AddressFormProps {
  /** Present when editing; absent when adding. */
  readonly address?: Address
  readonly onSaved: (addresses: AddressBookPayload['addresses']) => void
  readonly onCancel: () => void
}

export function AddressForm({ address, onSaved, onCancel }: AddressFormProps) {
  const editing = address !== undefined
  const prefix = editing ? `address-${address.id}` : 'address-new'
  const { pending, errors, formError, notice, handleSubmit } = useJsonForm<AddressBookPayload>({
    fields: FIELDS,
    send: (values) => (editing ? sendJson('PATCH', `/api/account/addresses/${address.id}`, values) : sendJson('POST', '/api/account/addresses', values)),
    onSuccess: (data) => onSaved(data.addresses),
  })
  return (
    <form noValidate onSubmit={handleSubmit} aria-label={editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ'} className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-card">
      <FormField idPrefix={prefix} name="recipient" label="Tên người nhận" error={errors.recipient}>
        {(props) => <input type="text" autoComplete="name" defaultValue={address?.recipient} {...props} />}
      </FormField>
      <FormField idPrefix={prefix} name="phone" label="Số điện thoại" error={errors.phone}>
        {(props) => <input type="tel" autoComplete="tel" defaultValue={address?.phone} {...props} />}
      </FormField>
      <FormField idPrefix={prefix} name="province" label="Tỉnh/Thành phố" error={errors.province}>
        {(props) => (
          <select defaultValue={address?.province ?? ''} {...props}>
            <option value="">Chọn tỉnh/thành</option>
            {PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        )}
      </FormField>
      <FormField idPrefix={prefix} name="address" label="Địa chỉ" error={errors.address}>
        {(props) => <input type="text" autoComplete="street-address" defaultValue={address?.address} {...props} />}
      </FormField>
      <FormStatus error={errors.form ?? formError} notice={notice} />
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Đang lưu…' : 'LƯU ĐỊA CHỈ'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={pending}>
          Huỷ
        </Button>
      </div>
    </form>
  )
}
