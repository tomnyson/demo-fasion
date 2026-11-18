import { appendRecord, dataPath, readRecords } from '@/lib/storage/jsonl-store'
import type { Order } from './schema'

export interface OrderRepository {
  create(order: Order): Promise<void>
  findByCode(code: string): Promise<Order | null>
}

export function createFileOrderRepository(filePath: string = dataPath('orders.jsonl')): OrderRepository {
  return {
    create: (order) => appendRecord(filePath, order),
    async findByCode(code) {
      const orders = await readRecords<Order>(filePath)
      return orders.find((order) => order.code === code) ?? null
    },
  }
}
