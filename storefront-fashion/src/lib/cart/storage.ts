import { z } from 'zod'
import { CART_STORAGE_KEY, MAX_LINE_QTY } from '@/config/commerce'
import { getProductById } from '@/lib/catalog/repository'
import { cartReducer } from './reducer'
import type { CartLine } from './types'

const LineShape = z.object({
  productId: z.string(),
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().min(1).max(MAX_LINE_QTY),
})

function toValidLine(raw: unknown): CartLine | null {
  const parsed = LineShape.safeParse(raw)
  if (!parsed.success) return null
  const { productId, size, color, quantity } = parsed.data
  const product = getProductById(productId)
  if (product === null) return null
  const matchedSize = product.sizes.find((s) => s === size)
  if (matchedSize === undefined || !product.colors.some((c) => c.name === color)) return null
  return { productId, size: matchedSize, color, quantity }
}

export function sanitizeLines(raw: unknown): readonly CartLine[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(toValidLine)
    .filter((line): line is CartLine => line !== null)
    .reduce<readonly CartLine[]>((acc, line) => cartReducer(acc, { type: 'add', line }), [])
}

export function loadCart(storage: Pick<Storage, 'getItem'>): readonly CartLine[] {
  try {
    const text = storage.getItem(CART_STORAGE_KEY)
    return text === null ? [] : sanitizeLines(JSON.parse(text))
  } catch {
    return []
  }
}

export function saveCart(storage: Pick<Storage, 'setItem'>, lines: readonly CartLine[]): void {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch (error) {
    console.warn('Không thể lưu giỏ hàng', error)
  }
}
