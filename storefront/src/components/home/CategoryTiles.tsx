import Image from 'next/image'
import Link from 'next/link'
import { SectionHead } from '@/components/ui/SectionHead'
import { getCategory } from '@/lib/catalog/repository'
import type { Category } from '@/lib/catalog/types'

const TILE_SLUGS = ['ao-bong-da', 'ao-cau-long', 'ao-pickleball', 'ao-bong-chuyen', 'ao-bong-ro', 'ao-polo'] as const

const TILES = TILE_SLUGS.map((slug) => getCategory(slug)).filter((c): c is Category => c !== null)

export function CategoryTiles() {
  return (
    <section className="container-site py-14">
      <SectionHead kicker="Danh mục sản phẩm" title="CHỌN MÔN THỂ THAO CỦA BẠN" />
      <ul className="mt-8 grid grid-cols-2 gap-4 min-[850px]:grid-cols-3">
        {TILES.map((category) => (
          <li key={category.slug}>
            <Link href={`/danh-muc/${category.slug}`} className="group relative block aspect-[3/2] overflow-hidden rounded-card">
              <Image src={category.image} alt="" fill sizes="(max-width: 849px) 50vw, 380px" className="object-cover transition group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/85 to-transparent" aria-hidden="true" />
              <span className="absolute bottom-3 left-4 right-4 text-lg font-black uppercase text-white">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
