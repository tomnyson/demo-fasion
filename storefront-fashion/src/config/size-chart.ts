import type { Size } from '@/lib/catalog/types'

export interface SizeRow {
  readonly size: Size
  readonly bust: string
  readonly waist: string
  readonly hip: string
}

export const SIZE_COLUMNS = ['Size', 'Ngực (cm)', 'Eo (cm)', 'Mông (cm)'] as const

export const SIZE_ROWS: readonly SizeRow[] = [
  { size: 'S', bust: '80 – 84', waist: '62 – 66', hip: '86 – 90' },
  { size: 'M', bust: '85 – 88', waist: '67 – 70', hip: '91 – 94' },
  { size: 'L', bust: '89 – 92', waist: '71 – 74', hip: '95 – 98' },
  { size: 'XL', bust: '93 – 97', waist: '75 – 80', hip: '99 – 103' },
  { size: 'XXL', bust: '98 – 103', waist: '81 – 87', hip: '104 – 109' },
]

export const MEASURE_STEPS: readonly string[] = [
  'Ngực: đo vòng quanh phần đầy nhất của ngực, giữ thước ngang và vừa chạm da.',
  'Eo: đo vòng quanh phần nhỏ nhất của eo, thường nằm trên rốn khoảng 2 cm.',
  'Mông: đo vòng quanh phần đầy nhất của mông, giữ thước song song với mặt đất.',
]
