import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="container-site py-20 text-center">
      <p className="text-sm font-bold uppercase text-brand">404</p>
      <h1 className="mt-2 text-[30px] font-black uppercase leading-tight text-navy">Không tìm thấy trang</h1>
      <p className="mt-3 text-muted">Trang bạn tìm không tồn tại hoặc đã được chuyển đi.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="blue" href="/">
          Về trang chủ
        </Button>
        <Button variant="red" href="/bao-gia">
          Nhận báo giá
        </Button>
      </div>
    </div>
  )
}
