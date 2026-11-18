# Lá Studio Storefront

Website bán đồ thể thao đội nhóm xây bằng Next.js 16 (App Router), React 19, Tailwind CSS 4 và TypeScript. Thương hiệu **Lá Studio**, dữ liệu và ảnh chỉ là mẫu (ảnh placeholder từ picsum.photos).

Hỗ trợ hai mô hình bán trên cùng một catalogue:

- **Hàng có sẵn (`ready`)**: chọn size, màu, số lượng, giỏ hàng, thanh toán, trang đặt hàng thành công.
- **Hàng thiết kế theo yêu cầu (`custom`)**: không có giỏ hàng, khách gọi điện, nhắn Zalo hoặc gửi form nhận báo giá.

## Chạy dự án

Yêu cầu Node.js và pnpm.

```bash
pnpm install
pnpm dev             # chạy chế độ phát triển, http://localhost:3000
pnpm build           # build production
pnpm start           # chạy bản đã build
pnpm lint            # ESLint
pnpm test            # unit test (Vitest)
pnpm test:coverage   # unit test kèm coverage, ngưỡng 80% cho src/lib và src/components
pnpm e2e             # test end-to-end (Playwright), tự build và chạy server ở cổng 3100
```

Lần đầu chạy e2e có thể cần `pnpm exec playwright install chromium`.

## Chỗ cần sửa khi đổi dữ liệu

| Việc cần làm | Tệp |
|---|---|
| Đổi thương hiệu: tên, hotline, email, địa chỉ, liên kết mạng xã hội | `src/config/site.ts` |
| Đổi sản phẩm và danh mục | `src/lib/catalog/products.ts` (danh mục: `src/lib/catalog/categories.ts`) |
| Đổi quy tắc bán hàng: phí giao hàng, ngưỡng miễn phí giao hàng, giới hạn số lượng | `src/config/commerce.ts` |
| Đổi menu và liên kết chính sách | `src/config/navigation.ts` |
| Đổi bài viết và nội dung chính sách | `src/lib/content/posts.ts`, `src/lib/content/policies.ts` |
| Đổi màu, bo góc, bóng đổ (design token) | `src/app/globals.css` |

## Lưu trữ đơn hàng và báo giá

Chưa có database. Đơn hàng và yêu cầu báo giá được ghi thành tệp JSON Lines (mỗi dòng một bản ghi) trong thư mục `DATA_DIR` (mặc định `.data/`) thông qua interface repository trong `src/lib/orders` và `src/lib/quotes`. Muốn dùng database thật, viết một repository mới theo cùng interface rồi thay vào chỗ đang dùng, phần còn lại của ứng dụng không phải đổi.

API: `POST /api/orders` và `POST /api/quotes`, phản hồi theo một envelope `{ success, data, error }`. Mỗi endpoint validate dữ liệu bằng schema zod, kiểm tra same-origin và giới hạn 5 request / 60 giây / IP.

## Lưu ý khi triển khai

- **Cần ổ đĩa bền vững.** Đơn hàng và báo giá là tệp JSON Lines dưới `DATA_DIR`, nên máy chủ cần một ổ đĩa lưu trữ lâu dài. Cách lưu này không phù hợp với hosting serverless (hệ thống tệp tạm thời, nhiều instance không chia sẻ dữ liệu). Hãy đổi repository sang database trước khi triển khai kiểu đó.
- **Giới hạn tần suất phụ thuộc `x-forwarded-for`.** Bộ giới hạn lấy địa chỉ client từ header `x-forwarded-for` và chỉ lưu trong bộ nhớ của từng process. Vì vậy môi trường production phải đặt sau một reverse proxy đáng tin cậy và proxy này phải ghi đè header đó. Nếu không, client có thể tự đặt giá trị để né giới hạn. Chạy nhiều process thì mỗi process đếm riêng.
- **Reverse proxy phải giữ nguyên `Host`.** Kiểm tra same-origin so sánh header `Origin` với header `Host` của request. Nếu proxy ghi đè `Host`, mọi lần gửi đơn hàng và báo giá sẽ bị từ chối với mã 403, nên hãy cấu hình proxy chuyển tiếp nguyên giá trị `Host` gốc.

## Ngoài phạm vi

Các phần sau chưa làm, cần plan riêng nếu muốn bổ sung:

- Admin
- Đăng nhập và tài khoản
- Wishlist
- Tích điểm
- Cổng thanh toán online
- Database thật
- Gửi email hoặc Zalo tự động
- Đa ngôn ngữ
- Bình luận blog
