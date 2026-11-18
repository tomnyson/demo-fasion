const VND_FORMAT = new Intl.NumberFormat('vi-VN')

export function formatVnd(amount: number): string {
  return `${VND_FORMAT.format(amount)} ₫`
}

export function discountPercent(price: number, compareAtPrice: number | null): number | null {
  if (compareAtPrice === null || compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
