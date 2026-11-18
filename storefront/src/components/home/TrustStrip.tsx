const ITEMS = [
  { title: 'Kinh nghiệm', text: 'Hơn 8 năm may đồng phục thể thao' },
  { title: '1000+ sản phẩm', text: 'Mẫu có sẵn và mẫu thiết kế riêng' },
  { title: 'Chất lượng', text: 'Vải thoáng khí, bền màu, đường may chắc' },
  { title: 'Hỗ trợ', text: 'Tư vấn tận tâm, phản hồi trong ngày' },
] as const

export function TrustStrip() {
  return (
    <section aria-label="Cam kết của Vertex Sport" className="container-site relative z-10 -mt-16">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line shadow-card min-[850px]:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title} className="bg-white p-5">
            <p className="text-lg font-black text-brand">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
