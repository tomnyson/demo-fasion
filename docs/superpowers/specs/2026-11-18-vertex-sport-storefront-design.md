# Vertex Sport Storefront — Design Spec

Ngày: 2026-11-18. Tham chiếu phong cách: https://enzosport.vn/ (chỉ lấy bố cục và ngôn ngữ thị giác).

## 1. Mục tiêu

Website bán đồ thể thao đội nhóm bằng Next.js, giao diện theo phong cách enzosport.vn, hỗ trợ **hai mô hình bán** trên cùng một catalogue:

- **Hàng có sẵn (`ready`)**: chọn size, màu, số lượng → giỏ hàng → thanh toán → trang đặt hàng thành công.
- **Hàng thiết kế theo yêu cầu (`custom`)**: không có giỏ hàng. Nút gọi điện, nhắn Zalo và form nhận báo giá.

## 2. Quyết định đã chốt với chủ dự án

| Câu hỏi | Quyết định |
|---|---|
| Hướng làm | Dự án Next.js mới trong `storefront/`. Template tĩnh DeskFlow ở thư mục gốc giữ nguyên, không sửa. |
| Mô hình bán | Cả hai: `ready` có giỏ hàng, `custom` liên hệ báo giá. |
| Thương hiệu | Thương hiệu mẫu **Vertex Sport**, dữ liệu mẫu, ảnh placeholder. |

## 3. Ngoài phạm vi (plan riêng nếu cần)

Admin, đăng nhập/tài khoản, wishlist, tích điểm, cổng thanh toán online, database thật, gửi email/Zalo tự động, đa ngôn ngữ, bình luận blog.

## 4. Ràng buộc pháp lý và nội dung

- Không dùng tên, logo, ảnh, số điện thoại, thông tin công ty hay nguyên văn đoạn mô tả của Enzo Sport.
- Tên câu lạc bộ, đội tuyển, nhãn hàng thật không xuất hiện trong dữ liệu mẫu.
- Ảnh: `https://picsum.photos/seed/<seed>/<w>/<h>`.
- Toàn bộ giao diện tiếng Việt, `lang="vi"`.

## 5. Thông tin thương hiệu mẫu (`src/config/site.ts`)

| Trường | Giá trị |
|---|---|
| name | `Vertex Sport` |
| tagline | `Uy tín · Chất lượng · Đúng hẹn` |
| hotlineDisplay / hotlineTel | `0900 000 000` / `tel:0900000000` |
| zaloUrl | `https://zalo.me/0900000000` |
| facebookUrl / messengerUrl | `https://facebook.com/` / `https://m.me/` |
| email | `hello@vertexsport.example` |
| address | `123 Đường Mẫu, Phường Mẫu, TP. Hồ Chí Minh` |
| mapUrl | `https://maps.google.com/` |

## 6. Ngôn ngữ thị giác (đo từ trang tham chiếu)

| Token | Giá trị |
|---|---|
| `brand` | `#00A0E3` |
| `navy` | `#061B3B` |
| `accent` (nút CTA đỏ) | `#F54C42` |
| `price` | `#FF4A43` |
| `ink` | `#081B38` |
| `muted` | `#68798B` |
| `line` | `#E2EBF4` |
| `soft` (nền section xen kẽ) | `#F3F7FB` |
| Hero gradient | `linear-gradient(120deg, #061A39, #082D64 58%, #0B3E82)` |
| Font | Roboto 400/500/600/700/900, subset `latin` + `vietnamese` |
| Container | tối đa `1180px`, gutter `22px` |
| Bo góc | khối/section card `18px`, product card `14px`, nút `999px` (pill) |
| Bóng | `0 14px 35px rgba(12,41,81,.11)` |
| Nút | cao 44px, padding `12px 24px`, 14px/600, chữ hoa. Ba biến thể: `red`, `blue`, `white` |
| Tiêu đề section | kicker 14px/700 chữ hoa màu `brand`, H2 30px/700 |
| Tiêu đề khối sản phẩm | 26px/900 chữ hoa màu `brand` |

Cảm giác chung: đậm, thể thao, tương phản cao, card trắng nổi trên nền `soft`, header trắng sticky, top bar và chân trang màu `navy`.

## 7. Catalogue

Dữ liệu tĩnh trong mã nguồn, truy cập qua repository (dễ thay bằng DB sau).

**Danh mục**

| slug | Tên | Cha | Loại sản phẩm | Số SP mẫu |
|---|---|---|---|---|
| `ao-bong-da` | Áo bóng đá | — | — | (gộp con) |
| `ao-bong-da-khong-logo` | Áo bóng đá không logo | `ao-bong-da` | ready | 20 |
| `ao-bong-da-thiet-ke` | Áo bóng đá thiết kế | `ao-bong-da` | custom | 4 |
| `ao-bong-da-cau-lac-bo` | Áo bóng đá câu lạc bộ | `ao-bong-da` | custom | 4 |
| `ao-cau-long` | Áo cầu lông | — | custom | 4 |
| `ao-pickleball` | Áo pickleball | — | custom | 4 |
| `ao-bong-chuyen` | Áo bóng chuyền | — | custom | 4 |
| `ao-bong-ro` | Áo bóng rổ | — | custom | 4 |
| `ao-polo` | Áo polo thể thao | — | custom | 4 |
| `phu-kien` | Phụ kiện | — | — | (gộp con) |
| `giay` / `bong` / `gang-tay` / `tat` | Giày / Bóng / Găng tay / Tất | `phu-kien` | ready | 4 mỗi loại |

Tổng 64 sản phẩm: 36 `ready`, 28 `custom`. Danh mục cha liệt kê sản phẩm của mọi danh mục con.

**Giá**: VND, số nguyên. Hiển thị `139.000 ₫`. Có `compareAtPrice` thì gạch giá cũ và hiện badge `-N%` (làm tròn). Sản phẩm `custom` hiện giá với tiền tố `Từ `.

**Size**: `S, M, L, XL, XXL`. Phụ kiện không có size dùng một size duy nhất `Free`.

## 8. Trang và URL

| URL | Nội dung |
|---|---|
| `/` | Trang chủ (mục 9) |
| `/danh-muc/[slug]` | Breadcrumb, số kết quả, sắp xếp, lưới 4 cột, 16 SP/trang, phân trang số |
| `/san-pham/[slug]` | Gallery, giá, điểm nổi bật, bảng size, khối mua hàng theo loại, mô tả, ưu đãi, sản phẩm tương tự (8) |
| `/tim-kiem?q=` | Tìm sản phẩm theo tên, không phân biệt dấu |
| `/gio-hang` | Giỏ hàng, sửa số lượng, xoá, tạm tính, phí ship |
| `/thanh-toan` | Form người nhận, phương thức thanh toán, tóm tắt đơn |
| `/dat-hang-thanh-cong/[code]` | Mã đơn, danh sách hàng, tổng tiền, hướng dẫn thanh toán |
| `/bao-gia` | Form nhận báo giá |
| `/lien-he` | Thông tin liên hệ, bản đồ (link), form báo giá rút gọn |
| `/tin-tuc`, `/tin-tuc/[slug]` | Danh sách và chi tiết bài viết mẫu (6 bài) |
| `/chinh-sach` | Bảo mật · Giao nhận & kiểm hàng · Đổi trả · Thanh toán |
| 404 | Trang không tìm thấy |

## 9. Trang chủ, thứ tự từ trên xuống

1. **Top bar** (`navy`): trái `Thiết kế miễn phí · Sản xuất nhanh · Giao hàng toàn quốc`; phải `Tư vấn 24/7 · 0900 000 000`.
2. **Header** trắng, sticky: logo chữ, menu, tìm kiếm, giỏ hàng (kèm số lượng), nút đỏ `NHẬN BÁO GIÁ` → `/bao-gia`.
   Menu: `Áo bóng đá ▾` (Không logo, Thiết kế, Câu lạc bộ) · `Áo cầu lông` · `Pickleball` · `Bóng chuyền` · `Bóng rổ` · `Polo` · `Phụ kiện ▾` (Giày, Bóng, Găng tay, Tất) · `Tin tức`.
   Mobile: nút mở menu off-canvas.
3. **Hero** gradient navy, bo 18px: kicker `Đồng phục đội nhóm · Trường lớp · Doanh nghiệp`; H1 `ĐỒ THỂ THAO / THIẾT KẾ THEO YÊU CẦU / CHO ĐỘI NHÓM` (dòng giữa màu `brand`); 4 điểm `Từ 5 bộ`, `Thiết kế miễn phí`, `In tên số logo`, `Sản xuất nhanh`; nút `NHẬN THIẾT KẾ MIỄN PHÍ` (đỏ → `/bao-gia`) và `XEM MẪU ÁO` (trắng → `#san-pham`); dòng `500+ đội nhóm đã tin tưởng`; ảnh bên phải.
4. **Trust strip** 4 ô, card trắng nổi đè lên mép dưới hero: `Kinh nghiệm`, `1000+ sản phẩm`, `Chất lượng`, `Hỗ trợ`.
5. **Danh mục**: kicker `Danh mục sản phẩm`, H2 `CHỌN MÔN THỂ THAO CỦA BẠN`, 6 ô ảnh 3 cột.
6. **Giới thiệu** (nền `soft`): ảnh + 4 ưu điểm.
7. **Quy trình**: kicker `Quy trình đặt hàng`, H2 `ĐƠN GIẢN – NHANH CHÓNG`, 5 bước đánh số 01–05: Tiếp nhận yêu cầu, Tư vấn & báo giá, Thiết kế & duyệt mẫu, Sản xuất, Giao hàng.
8. **Khối sản phẩm** (`id="san-pham"`, nền `soft`): mỗi khối là card trắng có tiêu đề, phụ đề, 4 product card, link `XEM TẤT CẢ →`. Thứ tự: không logo, thiết kế, cầu lông, pickleball, bóng chuyền, bóng rổ.
9. **3 banner ưu đãi** chèn sau khối thứ hai: `In tên số miễn phí`, `Mua càng nhiều giảm càng sâu`, `Miễn phí giao hàng từ 9 sản phẩm`. Mỗi banner dẫn tới `/bao-gia`.
10. **Dự án thực tế** (nền `brand`): 3 card `Đồng phục đội bóng`, `Đồng phục trường lớp`, `Đồng phục công ty`.
11. **CTA band**: `BẠN ĐANG CẦN ĐỒNG PHỤC CHO ĐỘI?`, nút `NHẮN ZALO NGAY` (xanh), `GỌI 0900 000 000` (đỏ), 4 dấu tích.
12. **Footer**: cột chính sách, cột kết nối, cột liên hệ; dải dưới `navy` có copyright.
13. **Nút nổi** (mọi trang): Zalo, gọi điện, Facebook ở góc trái dưới (desktop); thanh dính đáy 5 nút trên mobile: `Gọi điện`, `Facebook`, `Chat Zalo`, `Messenger`, `Chỉ đường`.

## 10. Product card

Ảnh vuông 1:1; badge `-N%` góc trên trái; hàng thumbnail màu (tối đa 6); tên 16px/800 tối đa 2 dòng; giá cũ gạch 14px + giá mới 20px/900 màu `price`. Card trắng bo 14px, viền `#E8EEF5`. Cả card là link tới trang sản phẩm.

## 11. Trang sản phẩm

- Chung: breadcrumb, gallery (ảnh chính + thumbnail theo màu), tên, giá, 4 điểm nổi bật, nút `Mở bảng size` (hộp thoại 3 tab `Size nam`, `Size nữ`, `Size trẻ em`), tab `Mô tả`, khối `ƯU ĐÃI KHI MUA HÀNG` 4 dòng, `Sản phẩm tương tự`.
- `ready`: chọn màu, chọn size, số lượng (1–99), nút `THÊM VÀO GIỎ` và `MUA NGAY` (thêm rồi chuyển `/thanh-toan`).
- `custom`: nút `LIÊN HỆ ĐẶT HÀNG` (tel) và `TƯ VẤN THIẾT KẾ` (Zalo), link `Nhận báo giá cho mẫu này` → `/bao-gia?san-pham=<slug>`.

## 12. Trang danh mục

Sắp xếp, nguyên văn: `Sắp xếp theo mức độ phổ biến`, `Sắp xếp theo mới nhất` (mặc định), `Sắp xếp theo giá: thấp đến cao`, `Sắp xếp theo giá: cao đến thấp`. Dòng đếm: `Hiển thị 1–16 của 28 kết quả`. Trạng thái nằm trên URL: `?sort=&page=`.

## 13. Giỏ hàng và đặt hàng

- Giỏ hàng lưu ở `localStorage`, khoá `vertex-cart-v1`. Một dòng = sản phẩm + size + màu.
- Phí giao hàng: `30.000 ₫`; miễn phí khi tổng số lượng ≥ 9.
- Thanh toán: `cod` (Thanh toán khi nhận hàng) hoặc `bank` (Chuyển khoản, hiện thông tin tài khoản mẫu ở trang thành công).
- Form người nhận: họ tên (2–80), điện thoại VN (`0` hoặc `+84` + 9 số), email (tuỳ chọn), tỉnh/thành, địa chỉ (5–200), ghi chú (≤ 500).
- Máy chủ **tự tính lại giá** từ catalogue, không tin số tiền từ client. Sản phẩm `custom` không được đặt qua giỏ.
- Mã đơn: `VS-YYMMDD-XXXXXXXX` (8 ký tự ngẫu nhiên từ `A-Z2-9`).
- Trang thành công không hiển thị số điện thoại hay địa chỉ.

## 14. Báo giá

Form: họ tên, điện thoại, môn thể thao (danh mục), số lượng (số nguyên 5–10000, tối thiểu 5 bộ), nội dung (≤ 1000), sản phẩm quan tâm (tuỳ chọn, điền sẵn từ `?san-pham=`). Gửi xong hiện thông báo `Đã nhận yêu cầu. Chúng tôi sẽ liên hệ trong 24 giờ.`

## 15. Lưu trữ và API

- Chưa có database. Đơn hàng và yêu cầu báo giá ghi vào tệp JSON Lines trong `DATA_DIR` (mặc định `.data/`) qua interface repository.
- `POST /api/orders`, `POST /api/quotes`. Phản hồi dùng một envelope: `{ success, data, error }`.
- Mọi endpoint: validate bằng schema, kiểm tra same-origin, giới hạn 5 request / 60 giây / IP, thông báo lỗi không lộ chi tiết nội bộ.

## 16. Chất lượng

- Responsive: 4 cột → 2 cột (≤ 849px); menu off-canvas trên mobile.
- Truy cập: mọi nút icon có nhãn, hộp thoại đóng bằng Esc, focus nhìn thấy được.
- TDD, coverage ≥ 80% cho `src/lib` và `src/components`.
- File ≤ 400 dòng, hàm ≤ 50 dòng, dữ liệu bất biến.
