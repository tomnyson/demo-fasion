export interface SizeRow {
  readonly size: string
  readonly a: string
  readonly b: string
}

export interface SizeTable {
  readonly id: 'nam' | 'nu' | 'tre-em'
  readonly label: string
  readonly columns: readonly [string, string, string]
  readonly rows: readonly SizeRow[]
}

const COLUMNS = ['Size', 'Chiều cao (cm)', 'Cân nặng (kg)'] as const

export const SIZE_TABLES: readonly SizeTable[] = [
  {
    id: 'nam',
    label: 'Size nam',
    columns: COLUMNS,
    rows: [
      { size: 'S', a: '155 – 164', b: '50 – 58' },
      { size: 'M', a: '165 – 169', b: '59 – 65' },
      { size: 'L', a: '170 – 174', b: '66 – 72' },
      { size: 'XL', a: '175 – 179', b: '73 – 79' },
      { size: 'XXL', a: '180 – 186', b: '80 – 88' },
    ],
  },
  {
    id: 'nu',
    label: 'Size nữ',
    columns: COLUMNS,
    rows: [
      { size: 'S', a: '148 – 153', b: '40 – 45' },
      { size: 'M', a: '154 – 159', b: '46 – 51' },
      { size: 'L', a: '160 – 164', b: '52 – 57' },
      { size: 'XL', a: '165 – 169', b: '58 – 63' },
      { size: 'XXL', a: '170 – 175', b: '64 – 70' },
    ],
  },
  {
    id: 'tre-em',
    label: 'Size trẻ em',
    columns: COLUMNS,
    rows: [
      { size: '6 – 7 tuổi', a: '115 – 125', b: '20 – 25' },
      { size: '8 – 9 tuổi', a: '126 – 135', b: '26 – 31' },
      { size: '10 – 11 tuổi', a: '136 – 145', b: '32 – 38' },
      { size: '12 – 13 tuổi', a: '146 – 155', b: '39 – 45' },
    ],
  },
]
