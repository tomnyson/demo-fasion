# Lá Studio — Tài khoản, mã giảm giá, sổ địa chỉ, lịch sử đơn — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm vào `storefront-fashion/` các tính năng: đăng ký/đăng nhập bằng email + mật khẩu, trang hồ sơ, sổ địa chỉ (chọn địa chỉ khi thanh toán), mã giảm giá, lịch sử đơn hàng với trạng thái và nút huỷ đơn.

**Architecture:** Giữ nguyên kiểu hiện có: route handler `/api/*` cùng `handleJsonPost` để kiểm tra same-origin, rate limit và zod; repository nằm trên lớp lưu trữ JSONL trong `.data`. Lớp lưu trữ chuyển sang mô hình append-only, đọc thì gộp theo id và bản ghi mới nhất thắng, kèm một mutex trong tiến trình cho mỗi file. Session lưu trong cookie httpOnly; server chỉ giữ hash của token. Mọi khoản tiền (giảm giá, phí ship, tổng) đều do server tính lại.

**Tech Stack:** Next.js 16.4 App Router, React 19, TypeScript, Tailwind 4, zod 4, `node:crypto` (scrypt, randomBytes, timingSafeEqual), Vitest (coverage ≥ 80%), Playwright (desktop + mobile).

**Spec:** Yêu cầu của người dùng ngày 2026-11-19: "bổ sung chức năng add mã giảm giá, lúc thanh toán có thể chọn nhiều địa chỉ khác nhau, trang profile của user, lịch sử đơn hàng". Lựa chọn đã chốt: chỉ làm Lá Studio, đăng nhập email + mật khẩu, thêm trạng thái đơn và huỷ đơn. Không có trang admin.

## Global Constraints

- Không thêm dependency runtime; auth tự viết bằng `node:crypto`.
- Next 16: trước khi viết mã, xác nhận qua Context7 cách dùng `cookies()` (async), `proxy.ts` (thay `middleware.ts`) và cách set cookie trong route handler.
- Toàn bộ nội dung giao diện bằng tiếng Việt có dấu, giữ đúng giọng văn hiện tại.
- Checkout cho khách vãng lai phải chạy như cũ. Bộ e2e hiện có (99 passed) phải xanh.
- Đơn cũ trong `orders.jsonl` vẫn đọc được: các trường mới là optional, `status` mặc định `'pending'`.
- Không bao giờ trả `passwordHash` hoặc token session ra client. Trang và API có dữ liệu người dùng dùng `dynamic = 'force-dynamic'` hoặc `Cache-Control: no-store`.
- Làm trên nhánh `feat/fashion-accounts`, không commit thẳng vào `main`.

## Quyết định thiết kế (giả định, sửa được)

| # | Quyết định |
|---|---|
| A1 | Mã giảm giá là danh sách cố định trong `src/config/coupons.ts`. Không có trang admin. |
| A2 | Có 3 loại mã: `percent` (có `maxDiscount`), `fixed` và `freeship`. Mỗi mã có thể đặt `minSubtotal`, `startsAt`/`endsAt`, `usageLimit` (tổng số lượt), `perUserLimit` và `requiresAccount`. |
| A3 | Mỗi đơn dùng tối đa 1 mã. Giảm giá tính trên tạm tính; tổng không âm. Mã `freeship` đưa phí ship về 0 và không ảnh hưởng `FREE_SHIP_MIN_ITEMS`. |
| A4 | Lượt dùng mã đếm từ các đơn có `status !== 'cancelled'`, nên huỷ đơn thì trả lại lượt. |
| A5 | Trạng thái đơn: `pending → confirmed → shipping → delivered`, cộng `cancelled`. Khách chỉ huỷ được khi đơn đang `pending`. Nhân viên đổi trạng thái bằng `pnpm order:status <CODE> <status>`. |
| A6 | Sổ địa chỉ tối đa 10 địa chỉ mỗi tài khoản, có 1 địa chỉ mặc định. Mỗi địa chỉ gồm tên người nhận, SĐT, tỉnh/thành, địa chỉ. |
| A7 | Session sống 30 ngày, cookie `ls_session` với `httpOnly`, `SameSite=Lax`, `Path=/`, và `Secure` khi chạy production. |
| A8 | Đơn của khách vãng lai không gắn với tài khoản tạo sau này, kể cả khi trùng email. |
| A9 | Trang thành công `/dat-hang-thanh-cong/[code]` giữ nguyên, vẫn public theo mã đơn. |

## Review Focus

1. Người dùng A mở `/tai-khoan/don-hang/<mã của B>` hoặc gọi API huỷ đơn của B → nhận 404 như đơn không tồn tại, không lộ dữ liệu. (Task 9)
2. Client sửa tổng hoặc giảm giá trong payload → server bỏ qua và tự tính. Mã hết hạn, chưa đủ `minSubtotal` hoặc hết lượt → 400 kèm thông báo ở trường `couponCode`. (Task 7, 8)
3. Hai request đăng ký cùng email, hoặc hai request huỷ cùng một đơn chạy song song → chỉ một request thành công. (Task 1, 3, 9)
4. Gửi `addressId` thuộc người khác hoặc không tồn tại → 400, đơn không được tạo. (Task 8)
5. Mở `/dang-nhap?next=https://evil.com` hoặc `?next=//evil.com` → sau khi đăng nhập về `/tai-khoan`. (Task 3)

---

### Task 0: Nhánh làm việc
- [ ] `git checkout -b feat/fashion-accounts` từ `main`.

### Task 1: Store có cập nhật và xoá, kèm mutex

**Files:** Create `src/lib/storage/collection.ts` + test. Không đụng `jsonl-store.ts`.

**Interfaces — Produces:**
- `withFileLock<T>(filePath: string, fn: () => Promise<T>): Promise<T>`: hàng đợi promise theo từng file, trong cùng tiến trình.
- `createCollection<T extends { id: string }>(filePath)`, gồm:
  - `all(): Promise<readonly T[]>`: gộp theo `id`, bản ghi cuối thắng, bỏ tombstone `{ id, deleted: true }`.
  - `get(id): Promise<T | null>`.
  - `put(record: T): Promise<void>`.
  - `remove(id): Promise<void>`.
  - `mutate<R>(fn: (items: readonly T[]) => { writes: readonly (T | { id: string; deleted: true })[]; result: R }): Promise<R>`: đọc, quyết định rồi ghi, tất cả trong lock.

**Tests:**
- Bản ghi mới nhất thắng.
- Đã xoá thì `get` trả `null`.
- Bỏ qua dòng hỏng.
- 20 lệnh `mutate` song song tăng một bộ đếm thì kết quả đúng 20.

### Task 2: Lõi auth (mật khẩu, user, session)

**Files:** Create `src/lib/auth/password.ts`, `users.ts`, `sessions.ts`, `schema.ts` + tests.

**Produces:**
- `hashPassword(pw): Promise<string>` cho ra chuỗi `scrypt$N$r$p$salt$hash`, với N=16384, r=8, p=1, salt 16 byte, hash 64 byte.
- `verifyPassword(pw, stored): Promise<boolean>` so sánh bằng `timingSafeEqual`; chuỗi lưu sai định dạng thì trả `false`.
- `User { id; email; name; phone?; passwordHash; createdAt }` và `PublicUser = Omit<User, 'passwordHash'>`.
- `createUserRepository(path?)`, gồm:
  - `register(input)` trả `{ok:true,user} | {ok:false,fields:{email:'Email đã được sử dụng.'}}`; kiểm tra trùng nằm trong `mutate`;
  - `findByEmail`, `findById`, `update(id, patch)`.
- Email được trim và chuyển chữ thường.
- `createSessionStore(path?)`, gồm:
  - `create(userId, now)` trả token 32 byte base64url; chỉ lưu `sha256(token)`, kèm `expiresAt`;
  - `resolve(token, now)` trả `userId | null`;
  - `destroy(token)`;
  - `destroyAllFor(userId)`.
- Schema zod `registerSchema`, `loginSchema`, `profileSchema`, `passwordChangeSchema`, với:
  - mật khẩu từ 8 đến 72 ký tự;
  - tên dùng lại `nameField`, SĐT dùng lại `phoneField`.

**Tests:**
- Hash rồi verify đúng; sai mật khẩu thì `false`.
- Đăng ký trùng email (khác hoa thường) thì bị từ chối, kể cả khi 2 lệnh `register` chạy song song.
- Session hết hạn thì `null`; sau `destroy` thì `null`.
- File chỉ chứa hash, không chứa token gốc.

### Task 3: API auth, trang đăng nhập/đăng ký, link tài khoản trên header

**Files:**
- Create `src/lib/auth/current-user.ts`: `getCurrentUser(): Promise<PublicUser | null>`, đọc `cookies()`.
- Create `src/lib/http/json-route.ts`: tổng quát hoá `handleJsonPost` cho POST, PATCH và DELETE, giữ cùng kiểm tra origin, rate limit và giới hạn body. `handleJsonPost` gọi lại helper mới.
- Routes:
  - `src/app/api/auth/register/route.ts`;
  - `src/app/api/auth/login/route.ts`, rate limit 10 lần/phút;
  - `src/app/api/auth/logout/route.ts`.
- Pages: `src/app/dang-nhap/page.tsx`, `src/app/dang-ky/page.tsx`.
- Component `src/components/account/AuthForm.tsx`.
- Sửa `Header.tsx` và `MobileMenu`: thêm link "Tài khoản" khi đã đăng nhập, "Đăng nhập" khi chưa.
- Create `src/lib/auth/safe-next.ts`: `safeNext(raw): string`. Chỉ chấp nhận đường dẫn bắt đầu bằng `/`, không phải `//`, không có `\`; còn lại trả `/tai-khoan`.

**Tests:**
- Đăng nhập sai email hoặc sai mật khẩu đều báo cùng một lỗi: "Email hoặc mật khẩu không đúng."
- Cookie có `HttpOnly` và `SameSite=Lax`.
- Logout xoá session record.
- Các trường hợp của `safeNext`, xem Review Focus #5.
- Response không bao giờ chứa `passwordHash`.

### Task 4: Trang hồ sơ và đổi mật khẩu

**Files:**
- `src/app/tai-khoan/layout.tsx`: chặn chưa đăng nhập bằng cách `redirect('/dang-nhap?next=...')`; có sidebar gồm Hồ sơ, Địa chỉ, Đơn hàng, Đăng xuất.
- `src/app/tai-khoan/page.tsx`: trang hồ sơ.
- `src/app/api/account/profile/route.ts` (PATCH tên, SĐT).
- `src/app/api/account/password/route.ts` (POST). Phải đúng mật khẩu cũ; sau khi đổi thì `destroyAllFor` rồi cấp session mới.

**Tests:**
- Chưa đăng nhập thì bị redirect.
- Đổi mật khẩu với mật khẩu cũ sai thì lỗi ở trường `currentPassword`.
- Đổi thành công thì session cũ hết hiệu lực.

### Task 5: Sổ địa chỉ

**Files:** `src/lib/addresses/{schema,repository}.ts`, `src/app/api/account/addresses/route.ts` (GET, POST), `src/app/api/account/addresses/[id]/route.ts` (PATCH, DELETE, `setDefault`), `src/app/tai-khoan/dia-chi/page.tsx`, `src/components/account/AddressBook.tsx` + tests.

**Produces:**
- `Address { id; userId; recipient; phone; province; address; isDefault; createdAt }`.
- `createAddressRepository()`, gồm:
  - `listFor(userId)`: địa chỉ mặc định đứng đầu;
  - `add(userId, input)`: địa chỉ đầu tiên tự thành mặc định; vượt 10 thì báo lỗi "Tối đa 10 địa chỉ.";
  - `update(userId, id, input)`;
  - `remove(userId, id)`: xoá địa chỉ mặc định thì địa chỉ mới nhất còn lại thành mặc định;
  - `setDefault(userId, id)`;
  - `getOwned(userId, id): Address | null`.
- Mọi thao tác ghi đều chạy qua `mutate`.

**Tests:**
- Sửa hoặc xoá địa chỉ của người khác trả 404.
- Luôn có đúng 1 địa chỉ mặc định khi sổ không rỗng.
- Thêm địa chỉ thứ 11 bị chặn.

### Task 6: Đơn hàng: trạng thái, gắn tài khoản, repository mới

**Files:**
- Sửa `src/lib/orders/schema.ts`. `Order` thêm `id` (= code), `userId?`, `status?`, `statusHistory?`, `couponCode?`, `discount?`.
- Thêm `OrderStatus` và `normalizeOrder(raw): Order`, đặt mặc định cho đơn cũ.
- Sửa `repository.ts` để dùng `createCollection`. Thêm:
  - `listForUser(userId)`, mới nhất trước;
  - `updateStatus(code, next, now, guard)`.
- Create `src/lib/orders/status.ts` với:
  - `STATUS_LABELS`: Chờ xác nhận, Đã xác nhận, Đang giao, Đã giao, Đã huỷ;
  - `canTransition(from, to)`;
  - `canCustomerCancel(order)`.
- Create `scripts/order-status.ts` và script `order:status` trong `package.json`, chạy bằng `node --experimental-strip-types`.

**Tests:**
- Đọc được dòng đơn cũ không có `status`.
- Bảng chuyển trạng thái hợp lệ và không hợp lệ.
- Gọi `updateStatus` song song chỉ áp dụng một lần.

### Task 7: Bộ máy mã giảm giá và tính tổng

**Files:**
- Create `src/config/coupons.ts` với 4 mã mẫu:
  - `LASTUDIO10`: giảm 10%, tối đa 50.000đ, đơn từ 300.000đ;
  - `GIAM50K`: giảm 50.000đ, đơn từ 500.000đ, `usageLimit` 100;
  - `FREESHIP`;
  - `THANHVIEN15`: giảm 15%, `requiresAccount`, `perUserLimit` 1.
- Create `src/lib/coupons/{types,evaluate}.ts`:
  - `evaluateCoupon(code, ctx: { subtotal; shipping; userId?; now; usage: { total; byUser } }): { ok:true; discount; shippingDiscount; coupon } | { ok:false; message }`;
  - mã được chuẩn hoá về chữ hoa và trim.
- Sửa `computeTotals(lines, coupon?)` để trả thêm `discount` và tính `total = max(0, subtotal - discount + shipping - shippingDiscount)`.
- Create `src/app/api/coupons/preview/route.ts` (POST `{code, lines}` trả số tiền giảm), rate limit 10 lần/phút.

**Messages:**
- "Mã giảm giá không tồn tại."
- "Mã đã hết hạn."
- "Đơn hàng chưa đạt giá trị tối thiểu {x}."
- "Mã đã hết lượt sử dụng."
- "Vui lòng đăng nhập để dùng mã này."

**Tests:**
- Mỗi nhánh lỗi có test riêng.
- `percent` bị chặn bởi `maxDiscount`.
- Mã `fixed` lớn hơn tạm tính thì tổng bằng 0 cộng phí ship.
- Đơn đã huỷ không tính vào lượt dùng.

### Task 8: Checkout: chọn địa chỉ và nhập mã

**Files:**
- Sửa `orderInputSchema`:
  - thêm `couponCode?` và `addressId?`;
  - `customer` là bắt buộc trừ khi có `addressId`;
  - thêm `saveAddress?: boolean`.
- Sửa `placeOrder`. Deps mới: `userId?`, `addresses`, `coupons usage source`. Bên trong `withFileLock(orders)`:
  1. Lấy địa chỉ từ sổ của chính user.
  2. Đánh giá mã giảm giá với lượt dùng hiện tại.
  3. Tạo đơn với `status: 'pending'`.
  4. Nếu có `saveAddress`, thêm địa chỉ vào sổ.
- Sửa `api/orders/route.ts` để đọc user hiện tại.
- UI:
  - `src/components/checkout/AddressPicker.tsx`: radio danh sách địa chỉ đã lưu, mặc định chọn địa chỉ mặc định, và lựa chọn "Giao tới địa chỉ khác", khi đó hiện `RecipientFields` cùng checkbox "Lưu vào sổ địa chỉ";
  - `CouponField.tsx`: ô nhập, nút "Áp dụng" gọi preview, hiện dòng "Giảm giá −x" trong `OrderSummary`, và nút "Bỏ mã".
- Khách vãng lai: form giữ như cũ, thêm `CouponField`.

**Tests:**
- Review Focus #2 và #4.
- Khách vãng lai đặt đơn như cũ; test checkout hiện có không đổi.
- `addressId` hợp lệ cho ra đơn với `customer` lấy từ sổ địa chỉ.
- Tổng hiển thị ở client bằng tổng server trả về.
- Trang thành công hiện dòng giảm giá.

### Task 9: Lịch sử đơn, chi tiết đơn, huỷ đơn

**Files:**
- `src/app/tai-khoan/don-hang/page.tsx`: danh sách gồm mã, ngày, số sản phẩm, tổng, nhãn trạng thái.
- `src/app/tai-khoan/don-hang/[code]/page.tsx`: chi tiết, timeline trạng thái, địa chỉ nhận, dòng giảm giá; nút "Huỷ đơn" kèm hộp xác nhận khi `canCustomerCancel`.
- `src/app/api/account/orders/[code]/cancel/route.ts` (POST).
- `src/components/account/OrderStatusBadge.tsx`, `OrderTimeline.tsx`.

**Tests:**
- Đơn của người khác trả 404 ở cả trang lẫn API (Review Focus #1).
- Huỷ đơn đang `confirmed` trả 409 "Đơn đã được xác nhận, vui lòng liên hệ shop để huỷ."
- Hai request huỷ song song: một trả 200, một trả 409.
- Danh sách rỗng hiện "Bạn chưa có đơn hàng nào." kèm nút mua sắm.

### Task 10: E2E, README, gate

**Files:** `e2e/account.spec.ts`, `e2e/coupon.spec.ts`. Mỗi test dùng email `e2e+<uuid>@example.com` và header `x-forwarded-for` riêng để tránh rate limit.

**Luồng:**
1. Đăng ký, đăng xuất, đăng nhập lại.
2. Thêm 2 địa chỉ, đặt địa chỉ mặc định.
3. Checkout chọn địa chỉ thứ hai, áp `LASTUDIO10`, kiểm tra tổng.
4. Lịch sử có đơn với nhãn "Chờ xác nhận"; bấm huỷ thì thành "Đã huỷ".
5. Khách vãng lai dùng `THANHVIEN15` thì thấy thông báo yêu cầu đăng nhập.

**README:** thêm mục tài khoản, danh sách mã mẫu, lệnh `pnpm order:status`, và các giả định A1–A9.

**Gate:** `pnpm lint && pnpm exec tsc --noEmit && pnpm test:coverage && pnpm build && pnpm e2e`. Coverage phải ≥ 80% và e2e toàn bộ xanh.

## Rủi ro

- **CAO.** Lưu trữ JSONL bằng file chỉ đúng khi chạy một tiến trình Node. Serverless hoặc nhiều instance sẽ mất dữ liệu hoặc ghi đè lẫn nhau. Mutex chỉ có tác dụng trong một tiến trình. Ghi rõ trong README; muốn chạy thật thì chuyển sang DB qua interface repository.
- **TRUNG BÌNH.** File append-only phình dần theo số lần sửa (session, địa chỉ). Chấp nhận được cho demo; có thể thêm bước compact sau.
- **TRUNG BÌNH.** Next 16 đổi API (`proxy.ts`, `cookies()` async). Xác nhận qua Context7 trước Task 3.
- **THẤP.** Rate limiter lưu trong bộ nhớ, nên reset khi restart server.

**Độ phức tạp:** Trung bình–cao, 11 task. Ước tính 10–14 giờ làm việc agent.
