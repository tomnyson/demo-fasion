import { MAX_LINE_QTY } from '@/config/commerce'
import { lineKey, type CartAction, type CartLine } from './types'

const clamp = (quantity: number): number => Math.min(MAX_LINE_QTY, Math.max(1, quantity))

export function cartReducer(state: readonly CartLine[], action: CartAction): readonly CartLine[] {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.line)
      if (!state.some((line) => lineKey(line) === key)) {
        return [...state, { ...action.line, quantity: clamp(action.line.quantity) }]
      }
      return state.map((line) =>
        lineKey(line) === key ? { ...line, quantity: clamp(line.quantity + action.line.quantity) } : line,
      )
    }
    case 'setQuantity': {
      if (!Number.isInteger(action.quantity)) return state
      if (!state.some((line) => lineKey(line) === action.key)) return state
      return state.map((line) => (lineKey(line) === action.key ? { ...line, quantity: clamp(action.quantity) } : line))
    }
    case 'remove': {
      if (!state.some((line) => lineKey(line) === action.key)) return state
      return state.filter((line) => lineKey(line) !== action.key)
    }
    case 'clear':
      return []
    case 'hydrate':
      return action.lines
  }
}
