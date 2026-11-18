import { SectionHead } from '@/components/ui/SectionHead'

const STEPS = [
  { title: 'Tiếp nhận yêu cầu', text: 'Cho chúng tôi biết số lượng, môn thể thao và ý tưởng.' },
  { title: 'Tư vấn & báo giá', text: 'Nhận báo giá chi tiết và gợi ý chất liệu phù hợp.' },
  { title: 'Thiết kế & duyệt mẫu', text: 'Xem bản thiết kế, chỉnh sửa đến khi hài lòng.' },
  { title: 'Sản xuất', text: 'May và in theo mẫu đã duyệt, kiểm tra từng bộ.' },
  { title: 'Giao hàng', text: 'Giao tận nơi trên toàn quốc, đúng hẹn.' },
] as const

export function Process() {
  return (
    <section className="container-site py-14">
      <SectionHead kicker="Quy trình đặt hàng" title="ĐƠN GIẢN – NHANH CHÓNG" />
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 min-[850px]:grid-cols-5">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-card border border-line bg-white p-5">
            <span className="text-3xl font-black text-brand">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 font-bold text-ink">{step.title}</h3>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
