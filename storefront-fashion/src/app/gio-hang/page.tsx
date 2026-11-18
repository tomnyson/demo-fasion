import type { Metadata } from 'next'
import { CartView } from './CartView'

export const metadata: Metadata = { title: 'Giỏ hàng' }

export default function CartPage() {
  return (
    <div className="container-site py-10">
      <h1 className="mb-6 text-[28px] font-black uppercase text-ink">Giỏ hàng</h1>
      <CartView />
    </div>
  )
}
