import type { Metadata } from 'next'
import { AddressBook } from '@/components/account/AddressBook'
import { requireAccountUser } from '@/lib/account/guard'
import { createAddressRepository, MAX_ADDRESSES } from '@/lib/addresses/repository'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sổ địa chỉ', robots: { index: false } }

export default async function AddressesPage() {
  const user = await requireAccountUser('/tai-khoan/dia-chi')
  const addresses = await createAddressRepository().listFor(user.id)
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-black uppercase leading-tight text-ink">Sổ địa chỉ</h1>
        <p className="mt-2 text-sm text-muted">Lưu tối đa {MAX_ADDRESSES} địa chỉ để chọn nhanh khi thanh toán.</p>
      </div>
      <AddressBook initial={addresses} />
    </section>
  )
}
