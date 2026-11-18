import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export const metadata: Metadata = { title: 'Thanh toán', robots: { index: false } }

export default function CheckoutPage() {
  return (
    <div className="container-site py-10">
      <h1 className="mb-6 text-[28px] font-black uppercase text-ink">Thanh toán</h1>
      <CheckoutForm />
    </div>
  )
}
