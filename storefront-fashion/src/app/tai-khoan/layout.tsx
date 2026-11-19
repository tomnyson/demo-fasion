import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AccountNav } from '@/components/account/AccountNav'
import { requestedAccountPath, requireAccountUser } from '@/lib/account/guard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false } }

export default async function AccountLayout({ children }: { readonly children: ReactNode }) {
  const user = await requireAccountUser(await requestedAccountPath())
  return (
    <div className="container-site py-8">
      <div className="grid min-w-0 gap-6 min-[850px]:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-3">
          <p className="break-words text-sm text-muted">
            Xin chào, <span className="font-bold text-ink">{user.name}</span>
          </p>
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
