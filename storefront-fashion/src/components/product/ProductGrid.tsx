import type { Product } from '@/lib/catalog/types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { readonly products: readonly Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 min-[850px]:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
