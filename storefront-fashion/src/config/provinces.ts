/** Delivery areas offered in checkout and the address book. */
export const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Tỉnh/thành khác'] as const

export type Province = (typeof PROVINCES)[number]
