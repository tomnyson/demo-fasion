import type { Metadata } from 'next'
import { PasswordForm, ProfileForm } from '@/components/account/ProfileForms'
import { requireAccountUser } from '@/lib/account/guard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Hồ sơ', robots: { index: false } }

export default async function ProfilePage() {
  const user = await requireAccountUser('/tai-khoan')
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-[28px] font-black uppercase leading-tight text-ink">Hồ sơ</h1>
      <div className="grid gap-6 min-[1100px]:grid-cols-2">
        <ProfileForm user={user} />
        <PasswordForm />
      </div>
    </section>
  )
}
