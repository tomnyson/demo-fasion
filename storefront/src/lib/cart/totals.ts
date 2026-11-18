import { FREE_SHIP_MIN_ITEMS, SHIPPING_FEE } from '@/config/commerce'
import { getProductById } from '@/lib/catalog/repository'
import type { Product } from '@/lib/catalog/types'
import { lineKey, type CartLine } from './types'

export interface PricedLine extends CartLine {
  readonly key: string
  readonly product: Product
  readonly lineTotal: number
}

export interface CartTotals {
  readonly lines: readonly PricedLine[]
  readonly itemCount: number
  readonly subtotal: number
  readonly shipping: number
  readonly total: number
}

export function computeTotals(lines: readonly CartLine[]): CartTotals {
  const priced = lines.flatMap((line): PricedLine[] => {
    const product = getProductById(line.productId)
    if (product === null) return []
    return [{ ...line, key: lineKey(line), product, lineTotal: product.price * line.quantity }]
  })
  const itemCount = priced.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = priced.reduce((sum, line) => sum + line.lineTotal, 0)
  const shipping = itemCount === 0 || itemCount >= FREE_SHIP_MIN_ITEMS ? 0 : SHIPPING_FEE
  return { lines: priced, itemCount, subtotal, shipping, total: subtotal + shipping }
}
