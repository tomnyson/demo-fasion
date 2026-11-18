# Fashion Storefront (trắng + xanh lá chuối) — Design Spec

Ngày: 2026-11-18. Tham chiếu bố cục: https://bigsizemol.com/ (chỉ lấy bố cục, không lấy nội dung).

## 1. Ý định

Một khách hàng muốn website bán thời trang có bố cục giống bigsizemol.com, đổi tông đen sang **trắng + xanh lá chuối**, và có **cột nút liên hệ nhanh** dính bên phải màn hình (Trang chủ, Hotline, Zalo, Messenger, Shopee, Tiktok).

Repo đã có `storefront/` (Vertex Sport, đồ thể thao, Next.js 16) với giỏ hàng, thanh toán, danh mục, tìm kiếm, tin tức. Site mới dùng lại nền đó để không viết lại phần bán hàng đã được kiểm thử.

## 2. Giả định cần khách xác nhận

Người đặt hàng không trả lời trực tiếp trong buổi thiết kế; các điểm dưới đây do trợ lý tự động trả lời thay hoặc do người viết tự quyết. Sai điểm nào thì sửa điểm đó trước khi xây.

| # | Giả định | Nếu sai thì |
|---|---|---|
| G1 | Đây là khách khác với Vertex Sport: hai site sống song song. | Xoá `storefront/` sau khi site mới xong. |
| G2 | Khách bán hàng may sẵn; mọi sản phẩm mua qua giỏ hàng. Không có báo giá, không đặt may. | Lấy lại luồng báo giá từ `storefront/`. |
| G3 | Hàng bán là thời trang nữ (như site tham chiếu). | Đổi dữ liệu mẫu và tên danh mục. |
| G4 | Xanh lá chuối = `#CFE89A` (đo từ ảnh mẫu khách gửi). | Đổi một token màu. |
| G5 | Chưa có tên thương hiệu, logo, ảnh thật: dùng thương hiệu mẫu **Lá Studio**. | Thay trong `src/config/site.ts`. |
| G6 | Chưa có link Shopee, Tiktok, Zalo, Messenger thật: dùng link mẫu. | Thay trong `src/config/site.ts`. |

## 3. Mục tiêu, ngoài phạm vi, điều phải tránh

**Mục tiêu**
- Trang chủ đúng bố cục site tham chiếu: thanh trên, header, slider lớn, ba khối sản phẩm, footer 4 cột.
- Tông trắng + xanh lá chuối nhất quán trên mọi trang.
- Cột 6 nút liên hệ nhanh có mặt ở mọi trang.
- Giữ nguyên chất lượng của nền cũ: giỏ hàng, thanh toán, kiểm tra phía máy chủ, test.

**Ngoài phạm vi**: admin, đăng nhập, cổng thanh toán online, database thật, gửi thông báo tự động, đa ngôn ngữ, bộ lọc sản phẩm theo size/màu/giá.

**Điều phải tránh**
- Dùng tên, logo, ảnh, số điện thoại, nội dung của bigsizemol.
- Chữ trắng trên nền xanh lá chuối (không đọc được).
- Cột nút liên hệ che nội dung hoặc nút mua hàng trên điện thoại.
- Sửa bất cứ thứ gì trong `storefront/` hoặc template DeskFlow ở thư mục gốc.

## 4. Các cách xây đã cân nhắc

| Cách | Được | Mất |
|---|---|---|
| **1. Sao `storefront/` thành app mới rồi sửa (đã chọn)** | Hai app độc lập, sửa cái này không ảnh hưởng cái kia; bắt đầu được ngay. | Lỗi ở phần chung phải sửa hai nơi. |
| 2. Tách phần chung thành package dùng chung | Sửa lỗi một lần. | Phải dựng monorepo và tách code trước; quá nặng cho hai site. |
| 3. Một app, đổi giao diện bằng cấu hình | Một bộ code. | Hai bố cục trang chủ khác hẳn nhau chung một app, rối dần. |

Chọn cách 1 vì hai site có bố cục và mô hình bán khác nhau, và G1 chưa chắc chắn: nếu hoá ra cùng một khách thì chỉ cần xoá app cũ.

## 5. Ràng buộc

- App mới ở `storefront-fashion/`, sao từ `storefront/` tại commit `32681c0`, không sao `node_modules`, `.next`, `.data`, `coverage`, `test-results`, `.env*`.
- Tên package `storefront-fashion`. Cổng dev `3001`, cổng Playwright `3101` (app cũ dùng `3000` và `3100`).
- Nhánh mới `feat/fashion-storefront`, tách từ `feat/vertex-sport-storefront` (vì `storefront/` chưa có trên `main`).
- Công nghệ giữ nguyên: Next.js 16.4 App Router, React 19, TypeScript, Tailwind 4, zod 4, Vitest, Playwright, pnpm.
- Quy tắc cũ vẫn áp dụng: giao diện tiếng Việt có dấu; ảnh chỉ từ `picsum.photos`; tiền là số nguyên VND; màu dùng qua token, không viết mã hex trong component; không mutate; file ≤ 400 dòng, hàm ≤ 50 dòng; coverage ≥ 80% cho `src/lib` và `src/components`; mọi endpoint validate, kiểm tra same-origin, giới hạn 5 request / 60 giây / IP.

## 6. Thương hiệu mẫu (`src/config/site.ts`)

| Trường | Giá trị |
|---|---|
| name | `Lá Studio` |
| tagline | `Thời trang nữ mỗi ngày` |
| hotlineDisplay / hotlineTel | `0900 000 000` / `tel:0900000000` |
| zaloUrl | `https://zalo.me/0900000000` |
| messengerUrl | `https://m.me/` |
| facebookUrl | `https://facebook.com/` |
| shopeeUrl | `https://shopee.vn/` |
| tiktokUrl | `https://www.tiktok.com/` |
| email | `hello@lastudio.example` |
| address | `123 Đường Mẫu, Phường Mẫu, TP. Hồ Chí Minh` |
| mapUrl | `https://maps.google.com/` |
| openingHours | `8:30 – 21:00 tất cả các ngày trong tuần` |

## 7. Màu và kiểu dáng

| Token | Giá trị | Dùng cho |
|---|---|---|
| `brand` | `#CFE89A` | thanh trên, nút liên hệ nhanh, nền nhãn, dải chân trang |
| `brand-strong` | `#3F6B1B` | nút chính (chữ trắng), link, gạch chân menu đang chọn |
| `brand-ink` | `#2F4A12` | chữ và icon đặt trên nền `brand` |
| `soft` | `#F7FBEF` | nền section xen kẽ |
| `line` | `#E3EDD3` | viền |
| `ink` | `#1F2A14` | chữ chính |
| `muted` | `#66705A` | chữ phụ |
| `price` | `#E5484D` | giá khuyến mãi, nhãn `-N%` |
| nền trang | trắng | |

- Bỏ các token `navy`, `accent` và gradient hero của bản cũ. Không còn màu xanh dương hay navy ở đâu.
- Font giữ Roboto (có sẵn, hỗ trợ tiếng Việt). Bo góc: card `14px`, nút bấm `999px`, nút liên hệ nhanh `16px`.
- Nút: `primary` (nền `brand-strong`, chữ trắng), `soft` (nền `brand`, chữ `brand-ink`), `outline` (viền `brand-strong`, nền trắng).
- Mọi cặp chữ/nền đạt tương phản tối thiểu 4.5:1.

## 8. Khung trang (mọi trang)

1. **Thanh trên** nền `brand`, chữ `brand-ink`: trái `Hỗ trợ khách hàng: 0900 000 000` (link gọi), phải `Điều khoản – Chính sách` → `/chinh-sach`.
2. **Header** nền trắng, dính trên cùng: logo chữ, menu, giỏ hàng (kèm số lượng), tìm kiếm.
   Menu: `Trang chủ` · `Sản phẩm ▾` (Đầm, Váy, Áo, Quần) · `Sale` · `Tin tức` · `Thời trang` · `Liên hệ`.
   Điện thoại: nút mở menu trượt, có ô tìm kiếm bên trong.
3. **Footer** nền trắng, 4 cột:
   - `THỜI TRANG NỮ LÁ STUDIO`: câu giới thiệu, hotline, giờ mở cửa, email, địa chỉ.
   - `GIỚI THIỆU`: Giới thiệu, Tin thời trang, Liên hệ, Chính sách bảo mật.
   - `HỖ TRỢ KHÁCH HÀNG`: Hướng dẫn mua hàng, Chính sách vận chuyển, Phương thức thanh toán, Quy định đổi hàng.
   - `KẾT NỐI`: Facebook, Tiktok, Shopee; dưới đó `PHƯƠNG THỨC THANH TOÁN`: COD, Chuyển khoản (nhãn chữ, không dùng logo thẻ).
   Dải dưới nền `brand`: `© {năm hiện tại} Lá Studio`.
4. **Cột nút liên hệ nhanh** (mục 9).

Bỏ khỏi khung: dải CTA `BẠN ĐANG CẦN ĐỒNG PHỤC…`, ba nút tròn nổi bên trái, nút `NHẬN BÁO GIÁ`.

## 9. Cột nút liên hệ nhanh

Sáu nút, theo thứ tự: `Trang chủ` (→ `/`), `Hotline` (gọi điện), `Zalo`, `Messenger`, `Shopee`, `Tiktok`.

- **Máy tính (≥ 850px):** cột dọc dính mép phải, canh giữa theo chiều cao màn hình. Mỗi nút là ô vuông 84px bo `16px`, nền `brand`, icon phía trên và nhãn phía dưới màu `brand-ink`, cách nhau 10px. Di chuột hoặc focus: nền đậm lên một bậc.
- **Điện thoại (< 850px):** thanh ngang dính đáy, sáu ô chia đều, cùng icon và nhãn (cỡ chữ nhỏ hơn). Trang có khoảng đệm đáy để thanh không che nội dung hay nút đặt hàng.
- Icon là SVG vẽ đơn giản trong mã nguồn (ngôi nhà, điện thoại, bong bóng chat, tia chớp trong bong bóng, túi mua hàng, nốt nhạc), **không dùng logo chính thức** của Zalo, Messenger, Shopee, Tiktok. Nhãn chữ cho biết kênh nào.
- Link ngoài mở tab mới với `rel="noopener noreferrer"`. Nút nào có URL rỗng trong cấu hình thì không hiển thị.
- Là `<nav aria-label="Liên hệ nhanh">`; mọi nút dùng được bằng bàn phím và có viền focus.

## 10. Trang chủ

1. **Slider** tràn ngang, 3 slide ảnh tỉ lệ 16:7 (điện thoại 4:5). Mỗi slide có tiêu đề ngắn và nút `MUA NGAY` → một danh mục. Có nút `‹` `›` và chấm chỉ trang. Tự chuyển sau 5 giây; dừng khi di chuột, khi focus, và tắt hẳn khi người dùng bật giảm chuyển động. Vuốt được trên điện thoại.
2. **SẢN PHẨM NỔI BẬT**: 8 sản phẩm, nút `XEM THÊM` → `/bo-suu-tap/noi-bat`.
3. **BEST SELLER**: 8 sản phẩm, `XEM THÊM` → `/bo-suu-tap/best-seller`.
4. **HÀNG MỚI VỀ**: 8 sản phẩm, `XEM THÊM` → `/bo-suu-tap/hang-moi`.

Tiêu đề khối canh trái, chữ hoa, đậm. Lưới 4 cột, điện thoại 2 cột. Không có khối nào khác trên trang chủ.

## 11. Danh mục, bộ sưu tập, sản phẩm

**Danh mục** (`/danh-muc/[slug]`): `dam` Đầm, `vay` Váy, `ao` Áo, `quan` Quần. Không có danh mục cha/con.

**Bộ sưu tập** (`/bo-suu-tap/[slug]`): cùng giao diện trang danh mục (sắp xếp, phân trang, 16 sản phẩm/trang).

| slug | Tên | Gồm |
|---|---|---|
| `noi-bat` | Sản phẩm nổi bật | sản phẩm có gắn nhãn `featured` |
| `best-seller` | Best seller | sản phẩm có gắn nhãn `best-seller` |
| `hang-moi` | Hàng mới về | sản phẩm có gắn nhãn `new` |
| `sale` | Sale | mọi sản phẩm có giá gốc cao hơn giá bán |

Menu `Sale` trỏ tới `/bo-suu-tap/sale`.

**Dữ liệu mẫu**: 48 sản phẩm, 12 mỗi danh mục; tên tự đặt, không dùng tên thương hiệu thật. Mỗi nhãn `featured`, `best-seller`, `new` gắn cho ít nhất 12 sản phẩm; ít nhất 16 sản phẩm đang giảm giá. Size `S, M, L, XL, XXL`. Mỗi sản phẩm 3–5 màu.

**Mô hình sản phẩm**: bỏ trường `kind`; mọi sản phẩm đều mua được qua giỏ. Thêm trường `tags`.

**Product card**: ảnh dọc tỉ lệ 3:4, nhãn `-N%`, tên tối đa 2 dòng, giá cũ gạch + giá mới. Bỏ hàng thumbnail màu và tiền tố `Từ `.

**Trang sản phẩm** (`/san-pham/[slug]`): gallery ảnh dọc, tên, giá, điểm nổi bật, chọn màu, chọn size, số lượng, `THÊM VÀO GIỎ`, `MUA NGAY`, bảng size (hai tab `Size nữ` theo số đo và `Cách đo`), mô tả, `Sản phẩm tương tự`. Bỏ khối liên hệ đặt may và link báo giá.

## 12. Nội dung

- `/tin-tuc`: bài thuộc mục `tin-tuc`. `/thoi-trang`: bài thuộc mục `thoi-trang`. Chi tiết bài ở `/tin-tuc/[slug]` cho cả hai mục. 6 bài mẫu, 3 mỗi mục.
- `/chinh-sach`: Bảo mật · Vận chuyển & giao nhận · Đổi hàng · Thanh toán · Hướng dẫn mua hàng.
- `/lien-he`: địa chỉ, hotline, email, giờ mở cửa, link bản đồ, và sáu kênh liên hệ dạng nút lớn. Không có form.
- `/gioi-thieu`: một trang giới thiệu ngắn.

## 13. Giữ nguyên từ nền cũ

Giỏ hàng (`localStorage`, khoá mới `la-studio-cart-v1`), thanh toán COD/chuyển khoản, phí giao hàng 30.000 ₫ và miễn phí từ 9 sản phẩm, `POST /api/orders` với kiểm tra và tính lại giá phía máy chủ, trang đặt hàng thành công (mã đơn đổi tiền tố thành `LS-`), tìm kiếm không dấu, 404, lưu đơn bằng JSON Lines.

## 14. Gỡ bỏ so với nền cũ

`src/lib/quotes/*`, `src/app/api/quotes`, `src/app/bao-gia`, `src/components/quote/*`, `ContactPanel`, `CtaBand`, `FloatingContacts`, `MobileContactBar`, các section trang chủ cũ (`Hero`, `TrustStrip`, `CategoryTiles`, `About`, `Process`, `PromoBanners`, `Projects`, `ProductBlock` kiểu cũ), `MIN_QUOTE_QTY`/`MAX_QUOTE_QTY`, mọi test và e2e của các phần đó. Không để lại code chết hay link tới trang đã gỡ.

## 15. Phần để người xây tự quyết

Nội dung câu chữ mẫu ngoài những chuỗi đã ghi rõ ở đây; hình vẽ cụ thể của 6 icon; cách hiện thực slider (CSS scroll-snap hay state); cách chia component; thứ tự công việc.

## 16. Quyết định chi tiết (người viết tự quyết sau khi reviewer đọc)

1. **Sao mã nguồn:** repo git nằm ở thư mục gốc dự án. Sao từ cây đã commit, không sao từ đĩa: `git archive 32681c0 storefront | tar -x` rồi đổi tên thư mục thành `storefront-fashion/`. Cách này tự loại mọi file chưa commit. App mới được commit trên nhánh `feat/fashion-storefront`.
2. **Nhãn và thứ tự:** `tags` là mảng chỉ đọc gồm các giá trị `featured`, `best-seller`, `new`, gán tay trong dữ liệu. `sale` không phải nhãn mà được tính từ giá. Thứ tự trên trang chủ: nổi bật và best seller theo độ phổ biến giảm dần, hàng mới theo ngày tạo mới nhất; lấy 8 sản phẩm đầu. Trang bộ sưu tập mặc định sắp xếp theo mới nhất.
3. **Bài viết:** thêm trường `section` (`tin-tuc` hoặc `thoi-trang`), giữ `tag` làm nhãn hiển thị. Breadcrumb trang chi tiết đi theo `section` của bài.
4. **Bảng size:** tab `Size nữ` có cột Size, Ngực (cm), Eo (cm), Mông (cm) cho S–XXL, số liệu mẫu. Tab `Cách đo` là ba dòng hướng dẫn đo ngực, eo, mông. Bỏ giá trị `Free` khỏi kiểu `Size`; giỏ hàng và kiểm tra đơn hàng chỉ nhận S–XXL.
5. **Chính sách:** một trang `/chinh-sach` với các mục có id `bao-mat`, `van-chuyen`, `doi-hang`, `thanh-toan`, `huong-dan-mua-hang`. Link ở footer và thanh trên trỏ tới đúng mục (ví dụ `/chinh-sach#van-chuyen`).
6. **Menu:** `Sản phẩm` trỏ tới `/san-pham`, trang liệt kê toàn bộ sản phẩm (cùng giao diện danh mục). Trên máy tính, menu con mở khi di chuột hoặc focus bàn phím như bản cũ. Trên điện thoại, bốn danh mục hiện sẵn dưới mục `Sản phẩm` trong menu trượt.
7. **Trang liệt kê:** `/san-pham`, `/danh-muc/[slug]`, `/bo-suu-tap/[slug]` dùng chung một component. Slug không tồn tại trả về 404. Bỏ `SubcategoryChips`. Các đường dẫn đã gỡ (`/bao-gia`…) trả về 404, không chuyển hướng.
8. **Điện thoại:** ngưỡng chuyển dạng là 850px như bản cũ (`min-[850px]`). Hộp thoại bảng size nằm trên thanh liên hệ. Khoảng đệm đáy trang bằng chiều cao thanh liên hệ.
9. **Dữ liệu đơn hàng:** vẫn ghi vào `.data/` bên trong thư mục app, nên hai app không dùng chung file.
10. **Chuỗi cấm ở mục 17** áp dụng cho mọi file trong `storefront-fashion/src`, kể cả test và comment.

## 17. Thế nào là xong

- `pnpm lint`, `tsc`, unit test (coverage ≥ 80%), `pnpm build`, e2e trên máy tính và điện thoại đều xanh trong `storefront-fashion/`.
- Không còn chuỗi `Vertex`, `Enzo`, `bigsizemol`, `báo giá`, `đồng phục` trong `storefront-fashion/src`.
- Không còn màu `#00A0E3`, `#061B3B`, `#F54C42` trong `storefront-fashion/src`.
- `storefront/` và thư mục gốc không có thay đổi nào (`git diff feat/vertex-sport-storefront -- storefront` rỗng).
- Cột nút liên hệ hiện đủ 6 nút ở mọi trang, đúng hai dạng máy tính và điện thoại, không gây cuộn ngang, không che nút `ĐẶT HÀNG`.
