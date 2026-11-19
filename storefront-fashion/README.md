# Lá Studio Storefront

Website bán thời trang nữ xây bằng Next.js 16 (App Router), React 19, Tailwind CSS 4 và TypeScript. Tông trắng và xanh lá chuối. Thương hiệu **Lá Studio**, dữ liệu và ảnh chỉ là mẫu. Ảnh demo nằm trong `public/demo/` (nguồn và giấy phép trong `public/demo/CREDITS.md`, ảnh miễn phí từ Pexels); cửa hàng cần thay bằng ảnh sản phẩm thật. Đường dẫn ảnh khai báo trong `src/config/demo-images.ts`.

Mọi sản phẩm mua qua giỏ hàng: chọn màu, size, số lượng, thanh toán COD hoặc chuyển khoản, trang đặt hàng thành công. Trang chủ có slider, ba khối sản phẩm (nổi bật, best seller, hàng mới về). Mọi trang có cột sáu nút liên hệ nhanh (Trang chủ, Hotline, Zalo, Messenger, Shopee, Tiktok): cột dọc bên phải từ 850px, thanh ngang dưới đáy trên điện thoại. Từ 850px, trang chừa 100px bên phải cho cột này.

## Chạy dự án

Yêu cầu Node.js và pnpm.

```bash
pnpm install
pnpm dev             # chạy chế độ phát triển, http://localhost:3001
pnpm build           # build production
pnpm start           # chạy bản đã build
pnpm lint            # ESLint
pnpm test            # unit test (Vitest), gồm kiểm tra vệ sinh mã nguồn
pnpm test:coverage   # unit test kèm coverage, ngưỡng 80% cho src/lib và src/components
pnpm e2e             # test end-to-end (Playwright), tự build và chạy server ở cổng 3101
```

Lần đầu chạy e2e có thể cần `pnpm exec playwright install chromium`.

## Chỗ cần sửa khi đổi dữ liệu

| Việc cần làm | Tệp |
|---|---|
| Đổi thương hiệu: tên, hotline, email, địa chỉ, liên kết Zalo, Messenger, Facebook, Shopee, Tiktok (cột liên hệ nhanh lấy từ đây) | `src/config/site.ts` |
| Đổi màu, bo góc, bóng đổ (design token) | `src/app/globals.css` |
| Đổi sản phẩm và nhãn `featured`, `best-seller`, `new` | `src/lib/catalog/products.ts` (danh mục: `src/lib/catalog/categories.ts`) |
| Đổi bảng size (ngực, eo, mông theo từng size) | `src/config/size-chart.ts` |
| Đổi các kênh liên hệ nhanh: thứ tự, nhãn, liên kết (cột bên phải và thanh dưới trên điện thoại) | `src/config/contacts.ts` |
| Đổi slide trang chủ | `src/config/slides.ts` |
| Đổi quy tắc giao hàng: phí giao hàng, ngưỡng miễn phí | `src/config/commerce.ts` |
| Đổi menu và liên kết chính sách | `src/config/navigation.ts` |
| Đổi bài viết và nội dung chính sách | `src/lib/content/posts.ts`, `src/lib/content/policies.ts` |

## Giả định cần khách xác nhận

Các điểm dưới đây do người xây tự quyết khi chưa có câu trả lời của khách. Sai điểm nào thì sửa điểm đó.

| # | Giả định | Nếu sai thì |
|---|---|---|
| G1 | Đây là khách khác với Vertex Sport: hai site sống song song. | Xoá `storefront/` sau khi site mới xong. |
| G2 | Khách bán hàng may sẵn; mọi sản phẩm mua qua giỏ hàng. Không có báo giá, không đặt may. | Lấy lại luồng báo giá từ `storefront/`. |
| G3 | Hàng bán là thời trang nữ (như site tham chiếu). | Đổi dữ liệu mẫu và tên danh mục. |
| G4 | Xanh lá chuối = `#CFE89A` (đo từ ảnh mẫu khách gửi). | Đổi một token màu. |
| G5 | Chưa có tên thương hiệu, logo, ảnh thật: dùng thương hiệu mẫu **Lá Studio**. | Thay trong `src/config/site.ts`. |
| G6 | Chưa có link Shopee, Tiktok, Zalo, Messenger thật: dùng link mẫu. | Thay trong `src/config/site.ts`. |
| G7 | Phí giao hàng 30.000 ₫, miễn phí từ 9 sản phẩm (giữ từ bản đồ thể thao đội nhóm). Ngưỡng này có thể không hợp với hàng may sẵn mua lẻ. | Đổi `SHIPPING_FEE` và `FREE_SHIP_MIN_ITEMS` trong `src/config/commerce.ts`, hoặc đổi sang ngưỡng theo giá trị đơn. |
| G8 | Màu giá và nhãn giảm giá là `#C62828` thay vì `#E5484D` đề xuất ban đầu, vì màu đỏ nhạt hơn không đạt tương phản 4,5:1 trên nền trắng. | Đổi token `price` trong `src/app/globals.css`, nhớ kiểm tra lại tương phản. |
| G9 | Toàn bộ nội dung chính sách, bài viết và trang giới thiệu là văn bản mẫu. | Khách phải thay hoặc duyệt trước khi mở bán. |

## Tài khoản khách hàng

- **Đăng ký / đăng nhập:** `/dang-ky` và `/dang-nhap` (nhận `?next=` để quay lại trang trước đó, chỉ chấp nhận đường dẫn nội bộ). Biểu tượng người ở header dẫn tới đăng nhập hoặc tài khoản; trên màn hình rất hẹp dùng menu.
- **Hồ sơ:** `/tai-khoan` sửa họ tên, số điện thoại và đổi mật khẩu (đổi xong các thiết bị khác bị đăng xuất). Có nút Đăng xuất.
- **Sổ địa chỉ:** `/tai-khoan/dia-chi` thêm, sửa, xoá, đặt địa chỉ mặc định. Ở trang thanh toán, khách đã đăng nhập chọn địa chỉ đã lưu (mặc định được chọn sẵn) hoặc nhập địa chỉ mới và tick "Lưu vào sổ địa chỉ".
- **Lịch sử đơn:** `/tai-khoan/don-hang` và `/tai-khoan/don-hang/[mã đơn]` xem trạng thái, sản phẩm, địa chỉ. Đơn của người khác trả về 404.
- **Huỷ đơn:** khách chỉ huỷ được khi đơn đang "Chờ xác nhận" (`pending`). Huỷ xong, lượt dùng mã giảm giá được trả lại.

### Đổi trạng thái đơn (nhân viên)

```bash
pnpm order:status <MÃ_ĐƠN> <trạng_thái>
# ví dụ: pnpm order:status LS-261119-ABCD2345 confirmed
```

Trạng thái: `pending` (Chờ xác nhận) → `confirmed` → `shipping` → `delivered`, hoặc `cancelled` (Đã huỷ). Lệnh chạy trên máy có ổ đĩa dữ liệu (`DATA_DIR`) và từ chối chuyển trạng thái không hợp lệ.

### Giả định về tài khoản và mã giảm giá

| # | Giả định |
|---|---|
| A1 | Mã giảm giá là danh sách cố định trong `src/config/coupons.ts`, không có trang admin. |
| A2 | Ba loại mã: `percent` (có `maxDiscount`), `fixed`, `freeship`; tuỳ chọn `minSubtotal`, thời hạn, `usageLimit`, `perUserLimit`, `requiresAccount`. |
| A3 | Mỗi đơn dùng tối đa 1 mã; giảm trên tạm tính, tổng không âm; `freeship` đưa phí ship về 0. |
| A4 | Lượt dùng mã chỉ đếm đơn không bị huỷ. |
| A5 | Trạng thái đơn như trên; khách chỉ huỷ khi `pending`; nhân viên đổi bằng `pnpm order:status`. |
| A6 | Sổ địa chỉ tối đa 10 địa chỉ mỗi tài khoản, có 1 địa chỉ mặc định. |
| A7 | Phiên đăng nhập 30 ngày, cookie `ls_session` (`httpOnly`, `SameSite=Lax`, `Secure` ở production). |
| A8 | Đơn của khách vãng lai không gắn với tài khoản tạo sau, kể cả khi trùng email. |
| A9 | Trang `/dat-hang-thanh-cong/[code]` vẫn công khai theo mã đơn. |

**Giới hạn lưu trữ:** người dùng, phiên, địa chỉ và đơn hàng đều là tệp JSON Lines, khoá ghi chỉ có tác dụng trong một process Node. Chỉ chạy một process trên một ổ đĩa bền vững; serverless hoặc nhiều instance sẽ mất hoặc ghi đè dữ liệu. Muốn chạy thật thì chuyển sang database qua interface repository.

## Mã giảm giá

- Danh sách mã nằm trong `src/config/coupons.ts`. Muốn thêm, sửa hoặc ngừng mã thì sửa file này.
- Mỗi mã thuộc một trong ba loại: `percent` (giảm theo %, có thể đặt mức giảm tối đa), `fixed` (giảm số tiền cố định) hoặc `freeship` (miễn phí giao hàng).
- Điều kiện tuỳ chọn: đơn tối thiểu, ngày bắt đầu, ngày kết thúc, tổng số lượt dùng, chỉ dành cho thành viên, giới hạn lượt dùng mỗi tài khoản.
- Mã mẫu:

  | Mã | Ưu đãi |
  |---|---|
  | `LASTUDIO10` | Giảm 10%, tối đa 50.000đ, cho đơn từ 300.000đ |
  | `GIAM50K` | Giảm 50.000đ cho đơn từ 500.000đ, tối đa 100 lượt |
  | `FREESHIP` | Miễn phí giao hàng |
  | `THANHVIEN15` | Mã ẩn, chỉ dành cho thành viên đã đăng nhập, mỗi tài khoản dùng 1 lần (đơn đã huỷ không tính). Khách vãng lai thấy thông báo yêu cầu đăng nhập. |

- Mã có `public: true` được hiện thành gợi ý ở trang thanh toán.
- Server tự tính lại giảm giá khi đặt đơn; số tiền client gửi lên bị bỏ qua. Lượt dùng được đếm từ `orders.jsonl`.
- Mỗi đơn chỉ dùng một mã.
- API xem trước mã (`/api/coupons/preview`) giới hạn 10 lần mỗi phút mỗi IP, để không đoán mã bằng cách thử liên tục.

## Lưu trữ đơn hàng

Chưa có database. Đơn hàng được ghi thành tệp JSON Lines (mỗi dòng một bản ghi) trong thư mục `DATA_DIR` (mặc định `.data/`) thông qua interface repository trong `src/lib/orders`. Muốn dùng database thật, viết một repository mới theo cùng interface rồi thay vào chỗ đang dùng, phần còn lại của ứng dụng không phải đổi.

API: `POST /api/orders`, phản hồi theo envelope `{ success, data, error }`. Endpoint validate dữ liệu bằng schema zod, kiểm tra same-origin và giới hạn 5 request / 60 giây / IP.

## Lưu ý khi triển khai

- **Cần ổ đĩa bền vững.** Đơn hàng là tệp JSON Lines dưới `DATA_DIR`, nên máy chủ cần một ổ đĩa lưu trữ lâu dài. Cách lưu này không phù hợp với hosting serverless (hệ thống tệp tạm thời, nhiều instance không chia sẻ dữ liệu). Hãy đổi repository sang database trước khi triển khai kiểu đó.
- **Giới hạn tần suất phụ thuộc `x-forwarded-for`.** Bộ giới hạn lấy địa chỉ client từ header `x-forwarded-for` và chỉ lưu trong bộ nhớ của từng process. Vì vậy môi trường production phải đặt sau một reverse proxy đáng tin cậy và proxy này phải ghi đè header đó. Nếu không, client có thể tự đặt giá trị để né giới hạn. Chạy nhiều process thì mỗi process đếm riêng.
- **Reverse proxy phải giữ nguyên `Host`.** Kiểm tra same-origin so sánh header `Origin` với header `Host` của request. Nếu proxy ghi đè `Host`, mọi lần gửi đơn hàng sẽ bị từ chối với mã 403, nên hãy cấu hình proxy chuyển tiếp nguyên giá trị `Host` gốc.

## Ngoài phạm vi

Các phần sau chưa làm, cần plan riêng nếu muốn bổ sung:

- Admin
- Quên mật khẩu, xác thực email, đăng nhập mạng xã hội
- Cổng thanh toán online
- Database thật
- Gửi email hoặc Zalo tự động
- Đa ngôn ngữ
- Bộ lọc sản phẩm theo size, màu, giá
