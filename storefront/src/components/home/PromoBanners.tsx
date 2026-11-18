import Link from 'next/link'

const BANNERS = [
  { title: 'In tên số miễn phí', text: 'Cho mọi đơn đồng phục đội nhóm.' },
  { title: 'Mua càng nhiều giảm càng sâu', text: 'Giá tốt hơn khi đặt số lượng lớn.' },
  { title: 'Miễn phí giao hàng từ 9 sản phẩm', text: 'Giao tận nơi trên toàn quốc.' },
] as const

export function PromoBanners() {
  return (
    <ul className="grid gap-4 min-[850px]:grid-cols-3">
      {BANNERS.map((banner) => (
        <li key={banner.title}>
          <Link
            href="/bao-gia"
            className="flex h-full flex-col justify-center rounded-card bg-hero p-6 text-white transition hover:brightness-110"
          >
            <span className="text-xl font-black uppercase">{banner.title}</span>
            <span className="mt-1 text-sm text-white/80">{banner.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
