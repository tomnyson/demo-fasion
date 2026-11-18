import { listProducts } from '@/lib/catalog/repository'
import type { CartLine } from '@/lib/cart/types'

/** Test fixtures shared by the order tests: A is a ready product, C is a custom (non-orderable) one. */
export const A = listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).items[0]
export const C = listProducts({ categorySlug: 'ao-bong-da-thiet-ke' }).items[0]

export const line = (quantity: number): CartLine => ({ productId: A.id, size: 'M', color: A.colors[0].name, quantity })

export const valid = {
  customer: { name: 'Nguyễn Văn A', phone: '0901 234 567', province: 'TP. Hồ Chí Minh', address: '12 Đường Mẫu' },
  payment: 'cod' as const,
  lines: [line(2)],
}
