import type { Category } from './types'

const make = (slug: string, name: string, parentSlug: string | null): Category =>
  Object.freeze({ slug, name, parentSlug, image: `https://picsum.photos/seed/${slug}/800/400` })

export const CATEGORIES: readonly Category[] = Object.freeze([
  make('ao-bong-da', 'Áo bóng đá', null),
  make('ao-bong-da-khong-logo', 'Áo bóng đá không logo', 'ao-bong-da'),
  make('ao-bong-da-thiet-ke', 'Áo bóng đá thiết kế', 'ao-bong-da'),
  make('ao-bong-da-cau-lac-bo', 'Áo bóng đá câu lạc bộ', 'ao-bong-da'),
  make('ao-cau-long', 'Áo cầu lông', null),
  make('ao-pickleball', 'Áo pickleball', null),
  make('ao-bong-chuyen', 'Áo bóng chuyền', null),
  make('ao-bong-ro', 'Áo bóng rổ', null),
  make('ao-polo', 'Áo polo thể thao', null),
  make('phu-kien', 'Phụ kiện', null),
  make('giay', 'Giày', 'phu-kien'),
  make('bong', 'Bóng', 'phu-kien'),
  make('gang-tay', 'Găng tay', 'phu-kien'),
  make('tat', 'Tất', 'phu-kien'),
])
