# Fashion Storefront (Lá Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork the existing `storefront/` app into `storefront-fashion/`, a women's-fashion shop laid out like bigsizemol.com in white and banana-leaf green, with a six-button quick-contact rail on every page.

**Architecture:** Copy the committed `storefront/` tree and change it in place: first rebrand, then delete the made-to-order flow, then swap the catalogue, then rebuild the listing routes, shell, home page and content pages. The cart, checkout, order API and their server-side validation are kept as they are and only re-pointed at the new catalogue.

**Tech Stack:** Next.js 16.4 (App Router), React 19, TypeScript, Tailwind CSS 4, zod 4, Vitest 5 + React Testing Library, Playwright, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-11-18-fashion-storefront-design.md`

## Global Constraints

- All work happens in `storefront-fashion/`. Never edit `storefront/`, the DeskFlow files in the repository root, or `docs/`. `git diff feat/vertex-sport-storefront -- storefront` must stay empty.
- Branch `feat/fashion-storefront`, created from `feat/vertex-sport-storefront`.
- Package name `storefront-fashion`. Dev port `3001`, Playwright port `3101`.
- Sample brand `Lá Studio`; values in spec section 6. No name, logo, image, phone number or copy from bigsizemol. No real fashion brand names in sample data. No official logos of Zalo, Messenger, Shopee or Tiktok: icons are simple hand-drawn SVGs.
- UI copy is Vietnamese with full diacritics; strings quoted in this plan and the spec are exact. Images only from `https://picsum.photos/seed/<seed>/<w>/<h>`.
- Colours come from the tokens in spec section 7, referenced by Tailwind theme name, never as hex literals in components. Every text/background pair has contrast ≥ 4.5:1. Never white text on `brand`.
- Banned in every file under `storefront-fashion/src` (code, tests, comments), case-insensitive: `Vertex`, `Enzo`, `bigsizemol`, `báo giá`, `đồng phục`, `#00A0E3`, `#061B3B`, `#F54C42`.
- Kept rules: money is an integer number of VND; never mutate; file ≤ 400 lines; function ≤ 50 lines; coverage ≥ 80% (lines, functions, branches, statements) for `src/lib/**` and `src/components/**`; every endpoint validates with zod, checks same-origin and is rate limited at 5 requests / 60 s / IP; Next.js 16 `params`/`searchParams` are awaited; pages render no `<main>` of their own (the layout does).
- The responsive switch is at 850px, written `min-[850px]:` as the existing code does.
- Run commands from `storefront-fashion/` unless a step says otherwise. Each task ends green on `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test` and `pnpm e2e`. One exemption: `e2e/links.spec.ts` may fail from Task 3 until Task 7 creates the last linked page; mark it `test.fixme` in Task 3 and restore it in Task 7.
- Commit format `<type>: <description>`; end each message with the trailer `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`. Do not push.

## Review Focus

1. **A cart left over from before** (the old storage key, a line with size `Free`, a product id that no longer exists): the new shop starts with an empty cart and never crashes or shows a phantom line. → Task 3.
2. **A contact channel the client has not supplied** (empty `shopeeUrl`, `tiktokUrl`, `zaloUrl` or `messengerUrl`): that button is absent, the rest keep their order, and the layout does not leave a gap. → Task 5.
3. **The contact bar on a small phone** (390px and 320px wide): it never covers `ĐẶT HÀNG`, `THÊM VÀO GIỎ` or the cart total, and no page scrolls sideways. → Task 5.
4. **The slider for someone who cannot or will not watch it move** (reduced-motion setting, keyboard only, hovering to read): it does not auto-advance, and every slide is reachable with buttons. A single slide shows no controls. → Task 6.
5. **A collection or category URL typed by hand** (`/bo-suu-tap/khong-co`, `/danh-muc/ao-bong-da` from the old shop, `?page=999&sort=xyz`): unknown slugs give the 404 page; bad parameters fall back; an empty collection shows a message instead of an empty grid. → Task 4.

---

## File Structure (changes relative to the copied app)

```
storefront-fashion/
  src/config/        site.ts* commerce.ts* navigation.ts* size-chart.ts* contacts.ts+ slides.ts+
  src/lib/catalog/   types.ts* categories.ts* products.ts* collections.ts+ repository.ts*
  src/lib/content/   posts.ts* policies.ts*
  src/lib/orders/    code.ts* schema.ts* fixtures.ts*
  src/lib/cart/      storage.ts*
  src/lib/quotes/    (deleted)
  src/components/
    layout/   TopBar* Header* MobileMenu* MobileNavList* Footer* QuickContactRail+ ContactIcon+
              (deleted: CtaBand, FloatingContacts, MobileContactBar)
    home/     HeroSlider+ useAutoAdvance+ CollectionBlock+
              (deleted: Hero, TrustStrip, CategoryTiles, About, Process, PromoBanners, Projects, ProductBlock)
    listing/  ListingView+ Pagination SortSelect
    product/  ProductCard* PurchasePanel SizeChartDialog* SizeTable* (deleted: ContactPanel)
    quote/    (deleted)
    ui/       Button* Price*
  src/app/
    page.tsx* layout.tsx* globals.css* icon.svg*
    san-pham/page.tsx+  danh-muc/[slug]/page.tsx*  bo-suu-tap/[slug]/page.tsx+
    thoi-trang/page.tsx+  gioi-thieu/page.tsx+  lien-he/page.tsx*  chinh-sach/page.tsx*
    bao-gia/ api/quotes/ danh-muc/[slug]/SubcategoryChips.tsx  (deleted)
  src/project-hygiene.test.ts+
  e2e/  (quote.spec.ts deleted; others updated; contacts.spec.ts+)
```
`*` modified, `+` new.

---

### Task 1: Fork the app and rebrand it

**Files:**
- Create: `storefront-fashion/` (copied tree)
- Modify: root `.gitignore`; in the new app `package.json`, `playwright.config.ts`, `src/config/site.ts`, `src/config/commerce.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/icon.svg`, `src/components/ui/Button.tsx`, `src/lib/orders/code.ts`, every component and test that names an old token, button variant, brand string or order-code prefix
- Test: `src/config/site.test.ts` (new), existing tests updated

**Interfaces:**
- Produces:
  - `SITE` with exactly the fields and values of spec section 6 (adds `shopeeUrl`, `tiktokUrl`, `openingHours`), `as const`.
  - `CART_STORAGE_KEY = 'la-studio-cart-v1'`. `MIN_QUOTE_QTY`/`MAX_QUOTE_QTY` stay until Task 2.
  - Tailwind colours `brand, brand-strong, brand-ink, soft, line, ink, muted, price, card-line` (`card-line` = `#E3EDD3`); `navy`, `accent` and `--background-image-hero` removed. `rounded-card` = 14px, `rounded-product` = 14px, new `rounded-contact` = 16px. `shadow-card` = `0 10px 30px rgba(47, 74, 18, 0.10)`.
  - `Button` `variant: 'primary' | 'soft' | 'outline'` (old `red` → `primary`, `blue` → `soft`, `white` → `outline`); styles per spec section 7.
  - `generateOrderCode` returns `LS-YYMMDD-XXXXXXXX`; `ORDER_CODE_PATTERN = /^LS-\d{6}-[A-Z2-9]{8}$/`.

- [ ] **Step 1: Create the branch and copy the committed tree** (run in the repository root)

```bash
git checkout feat/vertex-sport-storefront && git checkout -b feat/fashion-storefront
mkdir storefront-fashion && git archive 32681c0 storefront | tar -x --strip-components=1 -C storefront-fashion
printf '%s\n' 'storefront-fashion/.data/' 'storefront-fashion/coverage/' 'storefront-fashion/test-results/' 'storefront-fashion/playwright-report/' >> .gitignore
cd storefront-fashion && pnpm install
```

Set `"name": "storefront-fashion"` and `"dev": "next dev -p 3001"` in `package.json`; replace `3100` with `3101` in `playwright.config.ts`.

- [ ] **Step 2: Confirm the copy is green before changing it**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
Expected: 180 tests pass.

- [ ] **Step 3: Write the failing tests**

```ts
// src/config/site.test.ts
expect(SITE.name).toBe('Lá Studio')
expect(SITE).toMatchObject({ hotlineTel: 'tel:0900000000', shopeeUrl: 'https://shopee.vn/', tiktokUrl: 'https://www.tiktok.com/', openingHours: '8:30 – 21:00 tất cả các ngày trong tuần', email: 'hello@lastudio.example' })
expect(CART_STORAGE_KEY).toBe('la-studio-cart-v1')

// src/lib/orders/code.test.ts — change the expected values
expect(generateOrderCode(new Date('2026-11-18T03:00:00Z'), (n) => new Uint8Array(n))).toBe('LS-261118-AAAAAAAA')
expect(ORDER_CODE_PATTERN.test('VS-261118-AAAAAAAA')).toBe(false)

// src/components/ui/Button.test.tsx — add
render(<Button variant="primary">A</Button>); expect(screen.getByRole('button', { name: 'A' }).className).toContain('bg-brand-strong')
render(<Button variant="soft">B</Button>); expect(screen.getByRole('button', { name: 'B' }).className).toMatch(/bg-brand\b.*text-brand-ink|text-brand-ink.*bg-brand\b/)

// src/app/globals.test.ts (new) — reads globals.css as text
for (const [token, hex] of [['brand', '#CFE89A'], ['brand-strong', '#3F6B1B'], ['brand-ink', '#2F4A12'], ['soft', '#F7FBEF'], ['line', '#E3EDD3'], ['ink', '#1F2A14'], ['muted', '#66705A'], ['price', '#E5484D']])
  expect(css).toContain(`--color-${token}: ${hex};`)
expect(css).not.toMatch(/--color-(navy|accent)|background-image-hero/)
```

- [ ] **Step 4: Run to verify failure** — `pnpm test src/config src/lib/orders/code.test.ts src/components/ui/Button.test.tsx src/app/globals.test.ts` → FAIL.

- [ ] **Step 5: Implement the rebrand**

Apply the Interfaces above. Then replace every remaining use: `bg-navy`/`text-navy` → `bg-brand` with `text-brand-ink` (top bar, footer strip) or `text-ink`; `bg-accent` → `bg-brand-strong`; `bg-hero` → `bg-soft`; any `text-white` that now sits on `bg-brand` → `text-brand-ink`. Update `metadata.title` to `{ default: 'Lá Studio – Thời trang nữ mỗi ngày', template: '%s | Lá Studio' }`, `icon.svg` to an `L` mark in `#3F6B1B` on `#CFE89A`, the bank-transfer block and README brand name, and every test or e2e string that names the old brand, e-mail, storage key or `VS-` prefix.

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e`
Expected: all green. Run `grep -rniE "navy|accent|bg-hero|vertex|VS-" src e2e --exclude=globals.test.ts --exclude=code.test.ts` → no output.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: fork storefront into fashion app with Lá Studio brand and green palette"
```

---

### Task 2: Remove the made-to-order flow and old marketing sections

**Files:**
- Delete: `src/lib/quotes/`, `src/app/api/quotes/`, `src/app/bao-gia/`, `src/components/quote/`, `src/components/product/ContactPanel.tsx`, `src/components/layout/CtaBand.tsx`, `src/components/home/{Hero,TrustStrip,CategoryTiles,About,Process,PromoBanners,Projects}.tsx`, `e2e/quote.spec.ts`, and each deleted file's tests
- Modify: `src/config/commerce.ts`, `src/lib/catalog/types.ts`, `src/lib/catalog/products.ts`, `src/lib/cart/storage.ts`, `src/lib/orders/fixtures.ts`, `src/components/ui/Price.tsx`, `src/components/product/ProductCard.tsx`, `src/app/san-pham/[slug]/ProductView.tsx`, `src/components/layout/{Header,MobileMenu}.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/lien-he/page.tsx`, their tests, `e2e/{home,product,smoke,links}.spec.ts`

**Interfaces:**
- Produces:
  - `Product` without `kind`; type `ProductKind` deleted. Every product is purchasable.
  - `Price(props: { price: number; compareAtPrice: number | null; size?: 'card' | 'detail' })` — no `kind`, no `Từ ` prefix.
  - `ProductView` always renders `PurchasePanel`.
  - `sanitizeLines` no longer checks a kind (product must exist and have the size and colour).
  - `commerce.ts` without `MIN_QUOTE_QTY`/`MAX_QUOTE_QTY`.
  - Header and mobile menu without the `NHẬN BÁO GIÁ` button. Layout without `CtaBand`.
  - `src/app/page.tsx` renders only the existing `ProductBlock` list inside `#san-pham` (a placeholder home until Task 6). `/lien-he` shows contact details only, no form.

- [ ] **Step 1: Change the tests first**

```tsx
// Price.test.tsx
render(<Price price={139000} compareAtPrice={null} />)
expect(screen.queryByText(/Từ/)).toBeNull()

// storage.test.ts — replace the custom-product case
const anyProduct = listProducts({ pageSize: 100 }).items.at(-1)!
expect(loadCart(store(JSON.stringify([{ productId: anyProduct.id, size: anyProduct.sizes[0], color: anyProduct.colors[0].name, quantity: 1 }])))).toHaveLength(1)

// Header.test.tsx and MobileMenu.test.tsx
expect(screen.queryByRole('link', { name: /NHẬN/ })).toBeNull()

// service.test.ts — remove the `productId: C.id` case from the rejected-lines loop; keep the other four

// e2e/product.spec.ts — replace the "custom product offers contact" test
test('every product can be added to the cart', async ({ page }) => {
  await page.goto('/danh-muc/ao-cau-long'); await page.locator('main article a').first().click()
  await expect(page.getByRole('button', { name: 'THÊM VÀO GIỎ' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'LIÊN HỆ ĐẶT HÀNG' })).toHaveCount(0)
})
// e2e/smoke.spec.ts — add
test('removed pages answer 404', async ({ page }) => { expect((await page.goto('/bao-gia'))?.status()).toBe(404) })
```

Trim `e2e/home.spec.ts` to: the page has 24 product cards in `#san-pham` and no horizontal scroll.

- [ ] **Step 2: Run to verify failure** — `pnpm test` → the changed tests FAIL (and deleted modules are still imported).
- [ ] **Step 3: Delete the listed files and make the modifications above.** Remove every import, link and string that pointed at a deleted file.
- [ ] **Step 4: Verify** — `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e` → green. `grep -rniE "bao-gia|báo giá|quote|ProductKind|ContactPanel|CtaBand" src e2e` → no output.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "refactor: remove made-to-order flow and old marketing sections"`

---

### Task 3: Fashion catalogue, collections and product card

**Files:**
- Create: `src/lib/catalog/collections.ts`
- Modify: `src/lib/catalog/{types,categories,products,repository}.ts`, `src/config/navigation.ts`, `src/config/size-chart.ts`, `src/components/product/{ProductCard,SizeChartDialog,SizeTable}.tsx`, `src/lib/orders/schema.ts`, `src/lib/orders/fixtures.ts`, `src/app/danh-muc/[slug]/page.tsx` (compile fix only), `src/app/page.tsx` (use the new category slugs), `e2e/*.spec.ts` (new slugs), `e2e/links.spec.ts` (`test.fixme`)
- Delete: `src/app/danh-muc/[slug]/SubcategoryChips.tsx`
- Test: `src/lib/catalog/repository.test.ts`, `collections.test.ts`, `src/lib/cart/storage.test.ts`, `src/components/product/ProductCard.test.tsx`, `SizeChartDialog.test.tsx`, `src/config/navigation.test.ts` (new)

**Interfaces:**
- Produces:

```ts
// catalog/types.ts
export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ProductTag = 'featured' | 'best-seller' | 'new'
export type CollectionSlug = 'noi-bat' | 'best-seller' | 'hang-moi' | 'sale'
export interface Category { readonly slug: string; readonly name: string; readonly image: string }   // parentSlug removed
export interface Collection { readonly slug: CollectionSlug; readonly name: string }
// Product gains: readonly tags: readonly ProductTag[]

// catalog/collections.ts
export const COLLECTIONS: readonly Collection[]   // noi-bat 'Sản phẩm nổi bật', best-seller 'Best seller', hang-moi 'Hàng mới về', sale 'Sale'
export function isOnSale(product: Product): boolean                       // compareAtPrice !== null && compareAtPrice > price
export function inCollection(product: Product, slug: CollectionSlug): boolean

// catalog/repository.ts — removed: getTopCategories, getChildCategories
export function getCollection(slug: string): Collection | null
export function listProducts(opts: { categorySlug?: string; collectionSlug?: CollectionSlug; query?: string; sort?: SortKey; page?: number; pageSize?: number }): ProductPage
export function getCollectionPreview(slug: CollectionSlug, limit?: number): readonly Product[]   // default 8; noi-bat and best-seller by popularity desc, hang-moi and sale by createdAt desc

// config/navigation.ts
export const MAIN_NAV: readonly NavItem[]             // Trang chủ '/', Sản phẩm '/san-pham' [Đầm, Váy, Áo, Quần → '/danh-muc/<slug>'], Sale '/bo-suu-tap/sale', Tin tức '/tin-tuc', Thời trang '/thoi-trang', Liên hệ '/lien-he'
export const FOOTER_ABOUT_LINKS: readonly NavItem[]   // Giới thiệu '/gioi-thieu', Tin thời trang '/thoi-trang', Liên hệ '/lien-he', Chính sách bảo mật '/chinh-sach#bao-mat'
export const FOOTER_SUPPORT_LINKS: readonly NavItem[] // Hướng dẫn mua hàng '#huong-dan-mua-hang', Chính sách vận chuyển '#van-chuyen', Phương thức thanh toán '#thanh-toan', Quy định đổi hàng '#doi-hang' (all on '/chinh-sach'); POLICY_LINKS removed

// config/size-chart.ts
export interface SizeRow { readonly size: Size; readonly bust: string; readonly waist: string; readonly hip: string }
export const SIZE_ROWS: readonly SizeRow[]            // five rows S–XXL, sample centimetre ranges
export const MEASURE_STEPS: readonly string[]         // three lines: ngực, eo, mông
```

Data rules: categories `dam` Đầm, `vay` Váy, `ao` Áo, `quan` Quần. 48 products, 12 per category, generated per category by index `i` (0–11): `tags` = `['featured']` for `i` 0–2, `['best-seller']` for 3–5, `['new']` for 6–8, none for 9–11; on sale when `i % 3 === 0` (so 16 in total, `compareAtPrice = price + 60000`). Prices between `189000` and `459000`. Sizes S–XXL; 3 to 5 colours. Names are invented and start with the category noun (`Đầm suông cổ vuông Mộc`); only the 12 dresses contain the word `Đầm`. Product image `https://picsum.photos/seed/<slug>-<n>/900/1200`. `ProductCard`: image box `aspect-[3/4]`, no colour thumbnails. `SizeChartDialog`: title `Bảng size`, tabs `Size nữ` (table columns `Size`, `Ngực (cm)`, `Eo (cm)`, `Mông (cm)`) and `Cách đo`. The order schema's size enum becomes S–XXL.

- [ ] **Step 1: Write the failing tests**

```ts
// repository.test.ts (replace the old data expectations)
expect(getCategories().map((c) => c.slug)).toEqual(['dam', 'vay', 'ao', 'quan'])
expect(listProducts({}).total).toBe(48)
for (const slug of ['dam', 'vay', 'ao', 'quan']) expect(listProducts({ categorySlug: slug }).total).toBe(12)
expect(listProducts({ collectionSlug: 'noi-bat' }).total).toBe(12)
expect(listProducts({ collectionSlug: 'best-seller' }).total).toBe(12)
expect(listProducts({ collectionSlug: 'hang-moi' }).total).toBe(12)
expect(listProducts({ collectionSlug: 'sale' }).total).toBe(16)
expect(listProducts({ collectionSlug: 'sale', categorySlug: 'dam' }).total).toBe(4)
expect(listProducts({ query: 'dam' }).total).toBe(12)                       // no diacritics
const all = listProducts({ pageSize: 48 }).items
expect(new Set(all.map((p) => p.slug)).size).toBe(48)
expect(all.every((p) => p.sizes.join() === 'S,M,L,XL,XXL' && p.colors.length >= 3 && p.colors.length <= 5 && p.highlights.length === 4)).toBe(true)
expect(all.every((p) => p.price >= 189000 && p.price <= 459000 && Number.isInteger(p.price))).toBe(true)
expect(all.some((p) => 'kind' in p)).toBe(false)
expect(getCollection('sale')?.name).toBe('Sale'); expect(getCollection('khong-co')).toBeNull()
const preview = getCollectionPreview('noi-bat')
expect(preview).toHaveLength(8); expect(preview.every((p) => p.tags.includes('featured'))).toBe(true)
expect(preview.map((p) => p.popularity)).toEqual([...preview.map((p) => p.popularity)].sort((a, b) => b - a))
const fresh = getCollectionPreview('hang-moi', 3).map((p) => p.createdAt)
expect(fresh).toEqual([...fresh].sort().reverse())

// collections.test.ts
expect(isOnSale({ ...all[0], price: 200000, compareAtPrice: 260000 })).toBe(true)
expect(isOnSale({ ...all[0], compareAtPrice: null })).toBe(false)
expect(isOnSale({ ...all[0], price: 200000, compareAtPrice: 200000 })).toBe(false)

// storage.test.ts — Review Focus 1
expect(loadCart(store(JSON.stringify([{ productId: 'ENO-BD-01', size: 'M', color: 'Đỏ', quantity: 2 }])))).toEqual([])          // product from the old shop
expect(loadCart(store(JSON.stringify([{ productId: all[0].id, size: 'Free', color: all[0].colors[0].name, quantity: 1 }])))).toEqual([])
// CartProvider.test.tsx — add
localStorage.setItem('old-shop-cart-v1', JSON.stringify([{ productId: all[0].id, size: 'M', color: all[0].colors[0].name, quantity: 3 }]))
render(<CartProvider><Probe /></CartProvider>); await screen.findByText('items:0')                                                // old key is ignored

// navigation.test.ts
expect(MAIN_NAV.map((n) => n.label)).toEqual(['Trang chủ', 'Sản phẩm', 'Sale', 'Tin tức', 'Thời trang', 'Liên hệ'])
expect(MAIN_NAV[1].children?.map((c) => c.href)).toEqual(['/danh-muc/dam', '/danh-muc/vay', '/danh-muc/ao', '/danh-muc/quan'])
expect(MAIN_NAV[2].href).toBe('/bo-suu-tap/sale')
expect(FOOTER_SUPPORT_LINKS.map((l) => l.href)).toEqual(['/chinh-sach#huong-dan-mua-hang', '/chinh-sach#van-chuyen', '/chinh-sach#thanh-toan', '/chinh-sach#doi-hang'])

// ProductCard.test.tsx
expect(screen.getByRole('img', { name: product.name }).parentElement?.className).toContain('aspect-[3/4]')
expect(document.querySelectorAll('[data-testid="color-thumb"]').length).toBe(0)

// SizeChartDialog.test.tsx
expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Size nữ', 'Cách đo'])
expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Size', 'Ngực (cm)', 'Eo (cm)', 'Mông (cm)'])
expect(screen.getAllByRole('row')).toHaveLength(6)
// orders/schema.test.ts — add
expect(orderInputSchema.safeParse({ ...valid, lines: [{ ...line(1), size: 'Free' }] }).success).toBe(false)
```

- [ ] **Step 2: Run to verify failure** — `pnpm test` → FAIL.
- [ ] **Step 3: Implement** the Interfaces and data rules. Update Header, MobileNavList and Footer only as far as needed to compile against the new navigation exports (their redesign is Task 5). Point `page.tsx` blocks and every e2e at the new slugs (`/danh-muc/ao` and so on); mark `e2e/links.spec.ts` `test.fixme` with the comment `restored in Task 7`.
- [ ] **Step 4: Verify** — `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e` → green (links spec skipped).
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: replace catalogue with fashion products, collections and size chart"`

---

### Task 4: Shared listing view, all-products page and collection pages

**Files:**
- Create: `src/components/listing/ListingView.tsx`, `src/app/san-pham/page.tsx`, `src/app/bo-suu-tap/[slug]/page.tsx`
- Modify: `src/app/danh-muc/[slug]/page.tsx`, `src/app/tim-kiem/page.tsx`
- Test: `src/components/listing/ListingView.test.tsx`, `e2e/browse.spec.ts`

**Interfaces:**
- Consumes: `listProducts`, `getCategory`, `getCollection`, `parseListingParams`, `ProductGrid`, `Breadcrumb`, `SortSelect`, `Pagination`.
- Produces:

```ts
export function ListingView(props: {
  title: string
  crumbs: readonly { label: string; href?: string }[]
  result: ProductPage
  sort: SortKey
  basePath: string                    // e.g. '/bo-suu-tap/sale'
  query?: string                      // preserved in pagination links when set
  emptyMessage: string
  showSort?: boolean                  // default true
}): JSX.Element
```

`ListingView` renders the breadcrumb, an `<h1>`, and either `emptyMessage` (no count line, no sort, no grid) or the count line `Hiển thị {from}–{to} của {total} kết quả`, the sort select, the grid and the pagination. The four routes become thin wrappers: `/san-pham` (title `Tất cả sản phẩm`, empty message `Chưa có sản phẩm.`), `/danh-muc/[slug]` (`Chưa có sản phẩm trong danh mục này.`), `/bo-suu-tap/[slug]` (`Chưa có sản phẩm trong bộ sưu tập này.`), `/tim-kiem` (`showSort={false}`, its two existing messages kept). Unknown slug → `notFound()`; `generateStaticParams` and `generateMetadata` on both dynamic routes. The duplicated `hrefFor` builders are replaced by the one inside `ListingView`.

- [ ] **Step 1: Write the failing tests**

```tsx
// ListingView.test.tsx   (next/navigation mocked as in SortSelect.test.tsx)
const result = listProducts({ collectionSlug: 'sale' })
render(<ListingView title="Sale" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sale' }]} result={result} sort="newest" basePath="/bo-suu-tap/sale" emptyMessage="x" />)
expect(screen.getByRole('heading', { level: 1, name: 'Sale' })).toBeTruthy()
expect(screen.getByText('Hiển thị 1–16 của 16 kết quả')).toBeTruthy()
expect(screen.getAllByRole('article')).toHaveLength(16)
expect(screen.queryByRole('navigation', { name: 'Phân trang' })).toBeNull()          // one page
cleanup(); render(<ListingView title="A" crumbs={[]} result={listProducts({ query: 'zzzz' })} sort="newest" basePath="/san-pham" emptyMessage="Chưa có sản phẩm." />)
expect(screen.getByText('Chưa có sản phẩm.')).toBeTruthy()
expect(screen.queryByText(/Hiển thị/)).toBeNull(); expect(screen.queryByRole('combobox')).toBeNull()
cleanup(); render(<ListingView title="A" crumbs={[]} result={listProducts({})} sort="price-asc" basePath="/san-pham" query="a b" emptyMessage="x" />)
expect(screen.getByRole('link', { name: '2' }).getAttribute('href')).toBe('/san-pham?q=a+b&sort=price-asc&page=2')
```

```ts
// e2e/browse.spec.ts (replace the listing tests; keep the search tests with new numbers: 'dam' → 12 results)
test('all-products page paginates', async ({ page }) => {
  await page.goto('/san-pham'); await expect(page.getByText('Hiển thị 1–16 của 48 kết quả')).toBeVisible()
  await page.getByRole('link', { name: '3', exact: true }).click()
  await expect(page.getByText('Hiển thị 33–48 của 48 kết quả')).toBeVisible()
})
test('collection pages list the right products', async ({ page }) => {
  await page.goto('/bo-suu-tap/sale'); await expect(page.getByText('Hiển thị 1–16 của 16 kết quả')).toBeVisible()
  await expect(page.locator('main article').filter({ hasText: /-\d+%/ })).toHaveCount(16)
  await page.goto('/bo-suu-tap/hang-moi'); await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
})
test('hand-typed URLs fail safely', async ({ page }) => {           // Review Focus 5
  for (const url of ['/bo-suu-tap/khong-co', '/danh-muc/ao-bong-da', '/danh-muc/phu-kien'])
    expect((await page.goto(url))?.status(), url).toBe(404)
  expect((await page.goto('/san-pham?page=999&sort=xyz'))?.status()).toBe(200)
  await expect(page.getByText('Hiển thị 33–48 của 48 kết quả')).toBeVisible()
  expect((await page.goto('/bo-suu-tap/sale?page=abc'))?.status()).toBe(200)
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/components/listing` → FAIL.
- [ ] **Step 3: Implement `ListingView` and the four routes.**
- [ ] **Step 4: Verify** — `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e` → green.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add shared listing view, all-products and collection pages"`

---

### Task 5: Site shell and quick-contact rail

**Files:**
- Create: `src/config/contacts.ts`, `src/components/layout/QuickContactRail.tsx`, `src/components/layout/ContactIcon.tsx`, `e2e/contacts.spec.ts`
- Delete: `src/components/layout/FloatingContacts.tsx`, `MobileContactBar.tsx` and their tests
- Modify: `src/components/layout/{TopBar,Header,MobileMenu,MobileNavList,Footer}.tsx`, `src/app/layout.tsx`, their tests, `e2e/smoke.spec.ts`
- Test: `src/config/contacts.test.ts`, `src/components/layout/QuickContactRail.test.tsx`, updated `TopBar.test.tsx`, `Header.test.tsx`, `MobileMenu.test.tsx`, `Footer.test.tsx`

**Interfaces:**
- Consumes: `SITE`, `MAIN_NAV`, `FOOTER_ABOUT_LINKS`, `FOOTER_SUPPORT_LINKS`.
- Produces:

```ts
// config/contacts.ts
export type ContactId = 'home' | 'phone' | 'zalo' | 'messenger' | 'shopee' | 'tiktok'
export interface QuickContact { readonly id: ContactId; readonly label: string; readonly href: string; readonly external: boolean }
export function getQuickContacts(site?: { hotlineTel: string; zaloUrl: string; messengerUrl: string; shopeeUrl: string; tiktokUrl: string }): readonly QuickContact[]
// order and labels: Trang chủ '/', Hotline, Zalo, Messenger, Shopee, Tiktok; entries with an empty href are left out; 'home' and 'phone' are not external

// components/layout/ContactIcon.tsx
export function ContactIcon(props: { id: ContactId }): JSX.Element     // inline SVG, aria-hidden, currentColor, hand-drawn shapes
// components/layout/QuickContactRail.tsx — server component
export function QuickContactRail(props: { contacts?: readonly QuickContact[] }): JSX.Element | null   // default getQuickContacts(); null when the list is empty
```

`QuickContactRail` is one `<nav aria-label="Liên hệ nhanh">` with one list, styled two ways: below 850px a fixed bottom bar, items sharing the width equally, height 64px; from 850px a fixed column at the right edge, vertically centred, each item 84×84px, gap 10px, `rounded-contact`. Items: `bg-brand text-brand-ink`, icon above label, darker on hover and focus, visible focus ring. External links get `target="_blank" rel="noopener noreferrer"`. `layout.tsx` renders it once and gives the page `pb-16 min-[850px]:pb-0`.
Shell per spec section 8: `TopBar` (`bg-brand text-brand-ink`; left `Hỗ trợ khách hàng: 0900 000 000` as a `tel:` link; right link `Điều khoản – Chính sách` → `/chinh-sach`). `Header`: white, sticky; text logo; `MAIN_NAV` with the `Sản phẩm` dropdown opening on hover and `:focus-within`; cart icon; search form. The active top-level item is underlined in `brand-strong` (`aria-current="page"`), so the nav becomes a small client component using `usePathname`. `MobileMenu`: the four categories listed under `Sản phẩm`. `Footer`: four columns with headings `THỜI TRANG NỮ LÁ STUDIO`, `GIỚI THIỆU`, `HỖ TRỢ KHÁCH HÀNG`, `KẾT NỐI` (Facebook, Tiktok, Shopee) plus `PHƯƠNG THỨC THANH TOÁN` with the text labels `COD` and `Chuyển khoản`; bottom strip `bg-brand text-brand-ink` reading `© {new Date().getFullYear()} Lá Studio`.

- [ ] **Step 1: Write the failing tests**

```tsx
// contacts.test.ts
expect(getQuickContacts().map((c) => c.label)).toEqual(['Trang chủ', 'Hotline', 'Zalo', 'Messenger', 'Shopee', 'Tiktok'])
expect(getQuickContacts().map((c) => c.external)).toEqual([false, false, true, true, true, true])
const partial = getQuickContacts({ hotlineTel: 'tel:0900000000', zaloUrl: '', messengerUrl: 'https://m.me/', shopeeUrl: '', tiktokUrl: '' })
expect(partial.map((c) => c.id)).toEqual(['home', 'phone', 'messenger'])                 // Review Focus 2

// QuickContactRail.test.tsx
render(<QuickContactRail />)
const nav = screen.getByRole('navigation', { name: 'Liên hệ nhanh' })
expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Trang chủ', 'Hotline', 'Zalo', 'Messenger', 'Shopee', 'Tiktok'])
expect(within(nav).getByRole('link', { name: 'Hotline' }).getAttribute('href')).toBe('tel:0900000000')
expect(within(nav).getByRole('link', { name: 'Hotline' }).hasAttribute('target')).toBe(false)
const shopee = within(nav).getByRole('link', { name: 'Shopee' })
expect([shopee.getAttribute('target'), shopee.getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer'])
expect(nav.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(6)
expect(nav.querySelector('a')?.className).toMatch(/bg-brand\b/); expect(nav.querySelector('a')?.className).toContain('text-brand-ink')
expect(nav.innerHTML).not.toContain('text-white')
cleanup(); render(<QuickContactRail contacts={getQuickContacts({ hotlineTel: 'tel:1', zaloUrl: '', messengerUrl: '', shopeeUrl: '', tiktokUrl: '' })} />)
expect(screen.getAllByRole('listitem')).toHaveLength(2)
cleanup(); const { container } = render(<QuickContactRail contacts={[]} />); expect(container.innerHTML).toBe('')

// TopBar.test.tsx
expect(screen.getByRole('link', { name: /0900 000 000/ }).getAttribute('href')).toBe('tel:0900000000')
expect(screen.getByRole('link', { name: 'Điều khoản – Chính sách' })).toHaveProperty('pathname', '/chinh-sach')
// Header.test.tsx   (usePathname mocked to '/tin-tuc')
for (const label of ['Trang chủ', 'Sản phẩm', 'Sale', 'Tin tức', 'Thời trang', 'Liên hệ']) expect(screen.getByRole('link', { name: label })).toBeTruthy()
expect(screen.getByRole('link', { name: 'Tin tức' }).getAttribute('aria-current')).toBe('page')
expect(screen.getByRole('link', { name: 'Trang chủ' }).hasAttribute('aria-current')).toBe(false)
expect(screen.getByRole('link', { name: 'Đầm' })).toHaveProperty('pathname', '/danh-muc/dam')
// Footer.test.tsx
for (const h of ['THỜI TRANG NỮ LÁ STUDIO', 'GIỚI THIỆU', 'HỖ TRỢ KHÁCH HÀNG', 'KẾT NỐI', 'PHƯƠNG THỨC THANH TOÁN']) expect(screen.getByText(h)).toBeTruthy()
expect(screen.getByText(`© ${new Date().getFullYear()} Lá Studio`)).toBeTruthy()
expect(screen.getByText('8:30 – 21:00 tất cả các ngày trong tuần')).toBeTruthy()
expect(screen.getByRole('link', { name: 'Quy định đổi hàng' }).getAttribute('href')).toBe('/chinh-sach#doi-hang')
```

```ts
// e2e/contacts.spec.ts — Review Focus 3
const pages = ['/', '/san-pham', '/gio-hang', '/thanh-toan', '/lien-he']
test('the rail shows six contacts on every page', async ({ page }) => {
  for (const url of pages) { await page.goto(url); await expect(page.getByRole('navigation', { name: 'Liên hệ nhanh' }).getByRole('link')).toHaveCount(6) }
})
test('desktop rail is a right-edge column', async ({ page, isMobile }) => {
  test.skip(isMobile); await page.goto('/')
  const boxes = await page.getByRole('navigation', { name: 'Liên hệ nhanh' }).getByRole('link').evaluateAll((as) => as.map((a) => a.getBoundingClientRect()))
  expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(1)                     // one column
  expect(boxes[0].x + boxes[0].width).toBeGreaterThan(1280 - 40)                      // at the right edge
  expect(Math.round(boxes[0].width)).toBe(84)
})
for (const width of [390, 320]) test(`phone bar never covers the buy and order buttons at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 700 })
  await page.goto('/danh-muc/ao'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check()
  const bar = page.getByRole('navigation', { name: 'Liên hệ nhanh' })
  const overlaps = async (name: string) => {
    const btn = page.getByRole('button', { name }); await btn.scrollIntoViewIfNeeded()
    const [a, b] = [await btn.boundingBox(), await bar.boundingBox()]; return a!.y + a!.height > b!.y && a!.y < b!.y + b!.height
  }
  expect(await overlaps('THÊM VÀO GIỎ')).toBe(false)
  await page.getByRole('button', { name: 'MUA NGAY' }).click(); await page.waitForURL(/thanh-toan/)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  expect(await overlaps('ĐẶT HÀNG')).toBe(false)
  for (const url of ['/', '/san-pham', '/gio-hang', '/thanh-toan'])
    { await page.goto(url); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), url).toBe(true) }
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/config src/components/layout` → FAIL.
- [ ] **Step 3: Implement.** Delete the two old contact components and remove them from the layout.
- [ ] **Step 4: Verify** — `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e` → green on both projects.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add quick-contact rail and fashion site shell"`

---

### Task 6: Home page — slider and collection blocks

**Files:**
- Create: `src/config/slides.ts`, `src/components/home/HeroSlider.tsx`, `src/components/home/useAutoAdvance.ts`, `src/components/home/CollectionBlock.tsx`
- Delete: `src/components/home/ProductBlock.tsx` and its test
- Modify: `src/app/page.tsx`, `e2e/home.spec.ts`
- Test: `src/components/home/HeroSlider.test.tsx`, `useAutoAdvance.test.ts`, `CollectionBlock.test.tsx`, `HomeSections.test.tsx`

**Interfaces:**
- Consumes: `getCollection`, `getCollectionPreview`, `ProductGrid`, `Button`.
- Produces:

```ts
// config/slides.ts
export interface Slide { readonly id: string; readonly title: string; readonly image: string; readonly imageMobile: string; readonly href: string }
export const SLIDES: readonly Slide[]     // 3 slides; image 1600×700, imageMobile 800×1000 (picsum); href = a category or collection path; titles are own Vietnamese copy
// home/useAutoAdvance.ts
export function useAutoAdvance(opts: { count: number; intervalMs: number; paused: boolean; onAdvance: () => void }): void   // no timer when count < 2, paused, or prefers-reduced-motion
// home/HeroSlider.tsx — 'use client'
export function HeroSlider(props: { slides: readonly Slide[]; intervalMs?: number }): JSX.Element | null   // default 5000; null for an empty list
// home/CollectionBlock.tsx
export function CollectionBlock(props: { slug: CollectionSlug }): JSX.Element | null   // null when the preview is empty
```

`HeroSlider`: `<section aria-roledescription="carousel" aria-label="Bộ sưu tập nổi bật">`; one slide visible, the others `hidden` from assistive tech (`aria-hidden` and `inert`); each slide has an `<h2>` title and a `MUA NGAY` link to `href`; buttons `Slide trước` and `Slide sau` wrap around; dots are buttons `Chuyển tới slide {n}` with `aria-current="true"` on the active one; pauses while hovered or while focus is inside; swipe on touch through horizontal `scroll-snap` or pointer events (implementer's choice). With one slide: no buttons, no dots, no timer. `CollectionBlock`: `<section>` with an `<h2>` of the collection name shown upper-case through CSS, the 8 preview products in `ProductGrid`, and a link `XEM THÊM` → `/bo-suu-tap/<slug>`. Home page: `HeroSlider`, then `CollectionBlock` for `noi-bat`, `best-seller`, `hang-moi`, wrapped in `<div id="san-pham">`. Nothing else.

- [ ] **Step 1: Write the failing tests**

```tsx
// useAutoAdvance.test.ts   (vi.useFakeTimers; matchMedia stubbed)
const onAdvance = vi.fn(); renderHook(() => useAutoAdvance({ count: 3, intervalMs: 5000, paused: false, onAdvance }))
vi.advanceTimersByTime(4999); expect(onAdvance).not.toHaveBeenCalled()
vi.advanceTimersByTime(1); expect(onAdvance).toHaveBeenCalledTimes(1)
// paused: true → 0 calls after 20 s;  count: 1 → 0 calls;  matchMedia('(prefers-reduced-motion: reduce)').matches = true → 0 calls   (Review Focus 4)
// unmount → clearInterval called, no call afterwards

// HeroSlider.test.tsx   (fake timers; three slides A, B, C)
render(<HeroSlider slides={slides} />)
const current = () => screen.getByRole('heading', { level: 2 }).textContent
expect(current()).toBe('A')
act(() => vi.advanceTimersByTime(5000)); expect(current()).toBe('B')
fireEvent.click(screen.getByRole('button', { name: 'Slide trước' })); expect(current()).toBe('A')
fireEvent.click(screen.getByRole('button', { name: 'Slide trước' })); expect(current()).toBe('C')          // wraps
fireEvent.click(screen.getByRole('button', { name: 'Slide sau' })); expect(current()).toBe('A')
fireEvent.click(screen.getByRole('button', { name: 'Chuyển tới slide 2' })); expect(current()).toBe('B')
expect(screen.getByRole('button', { name: 'Chuyển tới slide 2' }).getAttribute('aria-current')).toBe('true')
fireEvent.mouseEnter(screen.getByRole('region', { name: 'Bộ sưu tập nổi bật' })); act(() => vi.advanceTimersByTime(20000)); expect(current()).toBe('B')   // paused on hover
fireEvent.mouseLeave(screen.getByRole('region', { name: 'Bộ sưu tập nổi bật' })); fireEvent.focus(screen.getByRole('button', { name: 'Slide sau' }))
act(() => vi.advanceTimersByTime(20000)); expect(current()).toBe('B')                                       // paused on focus
expect(screen.getByRole('link', { name: 'MUA NGAY' })).toHaveProperty('pathname', slides[1].href)
cleanup(); render(<HeroSlider slides={[slides[0]]} />); expect(screen.queryByRole('button')).toBeNull()
cleanup(); const { container } = render(<HeroSlider slides={[]} />); expect(container.innerHTML).toBe('')

// CollectionBlock.test.tsx
render(<CollectionBlock slug="best-seller" />)
expect(screen.getByRole('heading', { level: 2, name: 'Best seller' })).toBeTruthy()
expect(screen.getAllByRole('article')).toHaveLength(8)
expect(screen.getByRole('link', { name: 'XEM THÊM' })).toHaveProperty('pathname', '/bo-suu-tap/best-seller')

// HomeSections.test.tsx
render(<Home />)
expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent).slice(-3)).toEqual(['Sản phẩm nổi bật', 'Best seller', 'Hàng mới về'])
expect(document.querySelectorAll('#san-pham article')).toHaveLength(24)
expect(document.querySelector('main')).toBeNull()
```

```ts
// e2e/home.spec.ts
test('home shows the slider and three collections', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Bộ sưu tập nổi bật' })).toBeVisible()
  for (const name of ['Sản phẩm nổi bật', 'Best seller', 'Hàng mới về']) await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.locator('#san-pham article')).toHaveCount(24)
  await page.getByRole('link', { name: 'XEM THÊM' }).first().click(); await expect(page).toHaveURL(/\/bo-suu-tap\/noi-bat/)
})
test('slider works from the keyboard', async ({ page }) => {
  await page.goto('/'); const before = await page.getByRole('region', { name: 'Bộ sưu tập nổi bật' }).getByRole('heading').textContent()
  await page.getByRole('button', { name: 'Slide sau' }).focus(); await page.keyboard.press('Enter')
  await expect(page.getByRole('region', { name: 'Bộ sưu tập nổi bật' }).getByRole('heading')).not.toHaveText(before!)
})
test('slider stays still with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/')
  const heading = page.getByRole('region', { name: 'Bộ sưu tập nổi bật' }).getByRole('heading'); const first = await heading.textContent()
  await page.waitForTimeout(6500); await expect(heading).toHaveText(first!)
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/components/home` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Verify** — `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e` → green.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add home slider and collection blocks"`

---

### Task 7: Content pages

**Files:**
- Create: `src/app/thoi-trang/page.tsx`, `src/app/gioi-thieu/page.tsx`
- Modify: `src/lib/content/{posts,policies}.ts`, `src/app/tin-tuc/page.tsx`, `src/app/tin-tuc/[slug]/page.tsx`, `src/app/chinh-sach/page.tsx`, `src/app/lien-he/page.tsx`, `e2e/content.spec.ts`, `e2e/links.spec.ts` (restore)
- Test: `src/lib/content/posts.test.ts`

**Interfaces:**
- Consumes: `getQuickContacts`, `ContactIcon`, `Breadcrumb`, `SITE`.
- Produces:

```ts
export type PostSection = 'tin-tuc' | 'thoi-trang'
// Post gains: readonly section: PostSection
export const POST_SECTIONS: Readonly<Record<PostSection, { readonly name: string; readonly path: string }>>   // 'Tin tức' '/tin-tuc', 'Thời trang' '/thoi-trang'
export function getPosts(section?: PostSection): readonly Post[]      // newest first; all posts when omitted
// PolicySection id: 'bao-mat' | 'van-chuyen' | 'doi-hang' | 'thanh-toan' | 'huong-dan-mua-hang'   (in this order)
```

Six posts rewritten for fashion (styling, fabric care, choosing a size…), three per section, no banned words. `/tin-tuc` and `/thoi-trang` list their own section with the same card layout (each card an `<article>`); every post's detail stays at `/tin-tuc/[slug]`, with breadcrumb `Trang chủ` → the post's section → title. `/chinh-sach`: five `<section id>` blocks. `/lien-he`: address, hotline, e-mail, opening hours, map link, and the quick contacts except `home` as large buttons with icon and label; no form. `/gioi-thieu`: heading `Giới thiệu Lá Studio` and three short paragraphs.

- [ ] **Step 1: Write the failing tests**

```ts
// posts.test.ts
expect(getPosts()).toHaveLength(6)
expect(getPosts('tin-tuc')).toHaveLength(3); expect(getPosts('thoi-trang')).toHaveLength(3)
expect(getPosts('thoi-trang').every((p) => p.section === 'thoi-trang')).toBe(true)
expect(POLICY_SECTIONS.map((s) => s.id)).toEqual(['bao-mat', 'van-chuyen', 'doi-hang', 'thanh-toan', 'huong-dan-mua-hang'])

// e2e/content.spec.ts
// /tin-tuc and /thoi-trang each list 3 articles and share none;
// opening the first /thoi-trang article lands on /tin-tuc/<slug> whose breadcrumb contains a link 'Thời trang' → /thoi-trang;
// each of the 4 footer support links and the top-bar policy link lands on /chinh-sach with the matching section in the viewport;
// /lien-he shows 5 contact buttons (Hotline, Zalo, Messenger, Shopee, Tiktok) inside main and no <form>;
// /gioi-thieu has the heading 'Giới thiệu Lá Studio'.
```

Write the e2e scenarios out in full. Remove `test.fixme` from `e2e/links.spec.ts`, and add `/thoi-trang`, `/gioi-thieu`, `/san-pham` and `/bo-suu-tap/sale` to its start pages and to its console-error page list.

- [ ] **Step 2: Run to verify failure** — `pnpm test src/lib/content` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Verify** — `pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm e2e` → green, links spec included.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add fashion content, policy, contact and about pages"`

---

### Task 8: Hygiene check, final gates, README

**Files:**
- Create: `src/project-hygiene.test.ts`
- Modify: `README.md`, anything the checks below flag
- Test: `src/project-hygiene.test.ts`

- [ ] **Step 1: Write the hygiene test**

`src/project-hygiene.test.ts` walks every file under `src` (use `node:fs`), skipping itself, and asserts:

```ts
const banned = [/vertex/i, /enzo/i, /bigsizemol/i, /báo giá/i, /đồng phục/i, /#00A0E3/i, /#061B3B/i, /#F54C42/i]
expect(offenders).toEqual([])                                   // offenders = `${file}: ${pattern}` for every match
// components and app/*.tsx contain no hex colour literal (/#[0-9a-f]{3,8}\b/i), except src/app/globals.css and src/app/icon.svg
expect(hexOffenders).toEqual([])
// no source file is longer than 400 lines
expect(longFiles).toEqual([])
```

- [ ] **Step 2: Run it** — `pnpm test src/project-hygiene.test.ts`. Fix every offender it reports until it passes; do not narrow the patterns.

- [ ] **Step 3: Rewrite `README.md`** in Vietnamese: run commands and ports (`3001`, `3101`); where to change brand and contact links (`src/config/site.ts`), colours (`src/app/globals.css`), products and tags (`src/lib/catalog/products.ts`), slides (`src/config/slides.ts`), shipping rule (`src/config/commerce.ts`); the section `Giả định cần khách xác nhận` copying G1–G7 from spec section 2; the existing `Lưu ý khi triển khai` notes (persistent disk for `DATA_DIR`, trusted proxy that overwrites `x-forwarded-for` and preserves `Host`).

- [ ] **Step 4: Run every gate**

```bash
pnpm lint && pnpm exec tsc --noEmit && pnpm test:coverage && pnpm build && pnpm e2e
cd .. && git diff --stat feat/vertex-sport-storefront -- storefront ':(exclude)storefront-fashion' | tail -1
```

Expected: all green with every coverage threshold ≥ 80%; the `git diff` prints nothing. If coverage is short, add behavioural tests; do not lower thresholds or exclude files.

- [ ] **Step 5: Visual check with screenshots.** Start `pnpm dev`, capture `/`, `/san-pham`, one product page, `/gio-hang`, `/thanh-toan`, `/lien-he` at 1280×900, 390×844 and 320×700 into `test-results/visual/`, and read them. Confirm against spec sections 7–10: no blue or navy anywhere; green top bar with dark-green text; white sticky header; full-width slider; three collection blocks; four-column footer with green bottom strip; the rail as a right-edge column of six 84px green squares on desktop and a six-item bottom bar on phones; nothing covered by the bar; no sideways scroll. Fix what is wrong, list what was checked and fixed in the report, stop the dev server.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "test: add project hygiene check, update README and final polish"`
