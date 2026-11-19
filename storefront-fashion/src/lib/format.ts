const VND_FORMAT = new Intl.NumberFormat('vi-VN')

export function formatVnd(amount: number): string {
  return `${VND_FORMAT.format(amount)} ₫`
}

export function discountPercent(price: number, compareAtPrice: number | null): number | null {
  if (compareAtPrice === null || compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const SHOP_TIME_ZONE = 'Asia/Ho_Chi_Minh'
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('vi-VN', {
  timeZone: SHOP_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const DAY_FORMAT = new Intl.DateTimeFormat('vi-VN', { timeZone: SHOP_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' })

/** `10:05 18/11/2026` in shop time (Vietnam), for timestamps such as order status changes. */
export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso))
}

/** `18/11/2026` in shop time, from a full ISO timestamp. */
export function formatDay(iso: string): string {
  return DAY_FORMAT.format(new Date(iso))
}
