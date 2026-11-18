export function MobileSearchForm() {
  return (
    <form action="/tim-kiem" method="get" role="search" className="mb-3 flex items-center rounded-full border border-line bg-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-strong">
      <input type="search" name="q" placeholder="Tìm sản phẩm" aria-label="Tìm sản phẩm" className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none" />
      <button type="submit" className="px-4 py-2 text-sm font-semibold text-brand-strong">Tìm</button>
    </form>
  )
}
