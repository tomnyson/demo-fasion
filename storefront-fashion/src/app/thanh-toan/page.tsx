import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import type { CheckoutAccount } from '@/components/checkout/CheckoutRecipient'
import { createAddressRepository } from '@/lib/addresses/repository'
import { getCurrentUser } from '@/lib/auth/current-user'

// Reads the session to offer the customer's saved addresses; guests get the plain form.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Thanh toán', robots: { index: false } }

async function loadAccount(): Promise<CheckoutAccount | undefined> {
  const user = await getCurrentUser()
  if (user === null) return undefined
  return { addresses: await createAddressRepository().listFor(user.id) }
}

export default async function CheckoutPage() {
  const account = await loadAccount()
  return (
    <div className="container-site py-10">
      <h1 className="mb-6 text-[28px] font-black uppercase text-ink">Thanh toán</h1>
      <CheckoutForm account={account} />
    </div>
  )
}
