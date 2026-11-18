import type { Size } from '@/lib/catalog/types'

export interface CartLine {
  readonly productId: string
  readonly size: Size
  readonly color: string
  readonly quantity: number
}

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: readonly CartLine[] }

export function lineKey(line: Pick<CartLine, 'productId' | 'size' | 'color'>): string {
  return `${line.productId}|${line.size}|${line.color}`
}
