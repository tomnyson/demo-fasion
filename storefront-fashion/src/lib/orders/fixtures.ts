import { listProducts } from '@/lib/catalog/repository'
import type { CartLine } from '@/lib/cart/types'
import type { Order } from './schema'

/** Test fixtures shared by the order tests: A is a sample product. */
export const A = listProducts({ categorySlug: 'ao' }).items[0]

export const line = (quantity: number): CartLine => ({ productId: A.id, size: 'M', color: A.colors[0].name, quantity })

export const valid = {
  customer: { name: 'Nguyễn Văn A', phone: '0901 234 567', province: 'TP. Hồ Chí Minh', address: '12 Đường Mẫu' },
  payment: 'cod' as const,
  lines: [line(2)],
}

/** A stored order in the current shape; override any field. */
export const storedOrder = (code: string, patch: Partial<Order> = {}): Order => ({
  id: code,
  code,
  createdAt: '2026-11-18T03:00:00.000Z',
  status: 'pending',
  statusHistory: [{ status: 'pending', at: '2026-11-18T03:00:00.000Z' }],
  customer: { name: 'A B', phone: '0901234567', province: 'Hà Nội', address: '12 Đường Mẫu' },
  payment: 'cod',
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  ...patch,
})
