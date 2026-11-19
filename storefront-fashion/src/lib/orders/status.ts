/** Order lifecycle (A5): pending → confirmed → shipping → delivered, or cancelled. Kept dependency-free for the CLI. */
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export interface StatusChange {
  readonly status: OrderStatus
  readonly at: string
}

export const STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
}

/** The happy path, in order; `cancelled` can branch off before delivery. */
export const STATUS_FLOW: readonly OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered']

const TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value)
}

/** Staff transitions; customers are further limited by `canCustomerCancel`. */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

/** Customers may cancel only while the shop has not confirmed the order yet. */
export function canCustomerCancel(order: { readonly status: OrderStatus }): boolean {
  return order.status === 'pending'
}

export const CANCEL_BLOCKED_MESSAGES: Readonly<Record<Exclude<OrderStatus, 'pending'>, string>> = {
  confirmed: 'Đơn đã được xác nhận, vui lòng liên hệ shop để huỷ.',
  shipping: 'Đơn đang được giao, vui lòng liên hệ shop để được hỗ trợ.',
  delivered: 'Đơn đã giao thành công nên không thể huỷ.',
  cancelled: 'Đơn hàng đã được huỷ trước đó.',
}
