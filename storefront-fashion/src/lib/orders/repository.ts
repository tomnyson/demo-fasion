import { appendRecord, dataPath, readRecords } from '@/lib/storage/jsonl-store'
import type { Order } from './schema'

export interface OrderRepository {
  create(order: Order): Promise<void>
  findByCode(code: string): Promise<Order | null>
  /** Orders already placed with this coupon code. */
  countByCoupon(code: string): Promise<number>
}

export const ORDERS_FILE = 'orders.jsonl'

export function createFileOrderRepository(filePath: string = dataPath(ORDERS_FILE)): OrderRepository {
  return {
    create: (order) => appendRecord(filePath, order),
    async findByCode(code) {
      const orders = await readRecords<Order>(filePath)
      return orders.find((order) => order.code === code) ?? null
    },
    async countByCoupon(code) {
      const orders = await readRecords<Order>(filePath)
      return orders.filter((order) => order.couponCode === code).length
    },
  }
}
