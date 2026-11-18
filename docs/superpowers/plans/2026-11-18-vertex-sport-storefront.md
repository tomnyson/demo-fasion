# Vertex Sport Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js storefront for team sportswear in the visual style of enzosport.vn, selling ready-stock products through a cart and custom-made products through contact and quote requests.

**Architecture:** One Next.js App Router app in `storefront/`. Pure domain logic (catalogue, cart, orders, quotes) lives in `src/lib` behind repository interfaces and is unit tested; pages are Server Components that call it; the cart is a client context persisted to `localStorage`. Two route handlers accept orders and quotes, validate with zod, recompute prices server-side, and append to JSON Lines files.

**Tech Stack:** Next.js 16.4 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, zod 4, Vitest 5 + React Testing Library, Playwright, pnpm 10, Node 26.

**Spec:** `docs/superpowers/specs/2026-11-18-vertex-sport-storefront-design.md`

## Global Constraints

- All work happens in `storefront/`. Do not edit the DeskFlow template files in the repository root (`*.html`, `assets/`, `admin/`, `_build/`).
- Brand is the sample brand `Vertex Sport`. No Enzo Sport name, logo, image, phone number, company data or verbatim body copy. No real club, national team or sportswear brand names in sample data.
- UI copy is Vietnamese with full diacritics; `<html lang="vi">`. Strings quoted in this plan and in the spec are exact.
- Images: `https://picsum.photos/seed/<seed>/<w>/<h>` only.
- Design tokens are exactly those in spec section 6; reference them through Tailwind theme names (`bg-brand`, `text-price`…), never as hex literals in components.
- Next.js 16: `params` and `searchParams` are Promises and must be awaited. Scaffold with `--no-cache-components`.
- Money is an integer number of VND. Never use floats for money.
- Never mutate: reducers and helpers return new objects and arrays.
- Every API response uses `ApiResponse<T>` (Task 8). Every endpoint validates with zod, checks same-origin and is rate limited at 5 requests / 60 s / IP.
- Limits: file ≤ 400 lines, function ≤ 50 lines, nesting ≤ 4.
- Coverage ≥ 80% (lines, functions, branches, statements) for `src/lib/**` and `src/components/**`.
- Commit format `<type>: <description>`; types `feat, fix, refactor, docs, test, chore, perf, ci`.
- Run every command from `storefront/` unless a step says otherwise.

## Review Focus

Inputs the spec implies but does not spell out. Each has a pinned test in the task named.

1. **Corrupt or stale cart in `localStorage`** (bad JSON, old shape, a product since removed, a `custom` product id): the cart loads empty or drops the bad lines; the page never crashes. → Task 7.
2. **Garbage listing URL** (`?page=abc`, `?page=-3`, `?page=999`, `?sort=xyz`, unknown category slug): falls back to page 1 / last page / default sort; unknown slug gives the 404 page, never a 500. → Tasks 2 and 5.
3. **Tampered order payload** (client-sent prices, quantity `0` or `1000`, a `custom` product, an unknown product, a size the product does not have): rejected with 400 and a field error; totals always come from the catalogue. → Task 8.
4. **Repeated submit** (double click, impatient retries): the submit button is disabled while the request is pending; the sixth request in a minute gets 429 and the form shows `Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.` → Tasks 8 and 9.
5. **Vietnamese search typed without diacritics** (`ao bong da`, mixed case, extra spaces) and an empty query: matches `Áo bóng đá…`; an empty query shows a prompt, not all products. → Tasks 2 and 5.

---

## File Structure

```
.gitignore                              repo root
storefront/
  next.config.ts                        picsum remote pattern
  vitest.config.mts  vitest.setup.ts
  playwright.config.ts
  e2e/                                  smoke, browse, quote, checkout specs
  src/
    app/
      layout.tsx  globals.css  not-found.tsx  page.tsx
      danh-muc/[slug]/page.tsx
      san-pham/[slug]/page.tsx
      tim-kiem/page.tsx
      gio-hang/page.tsx
      thanh-toan/page.tsx
      dat-hang-thanh-cong/[code]/page.tsx
      bao-gia/page.tsx  lien-he/page.tsx  chinh-sach/page.tsx
      tin-tuc/page.tsx  tin-tuc/[slug]/page.tsx
      api/orders/route.ts  api/quotes/route.ts
    config/        site.ts  commerce.ts  navigation.ts  size-chart.ts
    lib/
      format.ts  text.ts
      catalog/     types.ts  categories.ts  products.ts  repository.ts  listing-params.ts
      cart/        types.ts  reducer.ts  storage.ts  totals.ts
      orders/      schema.ts  code.ts  service.ts  repository.ts
      quotes/      schema.ts  repository.ts
      http/        api-response.ts  rate-limit.ts  same-origin.ts  client.ts
      storage/     jsonl-store.ts
      content/     posts.ts  policies.ts
    components/
      ui/          Button.tsx  SectionHead.tsx  Breadcrumb.tsx  Price.tsx
      layout/      TopBar.tsx  Header.tsx  MobileMenu.tsx  Footer.tsx  CtaBand.tsx  FloatingContacts.tsx  MobileContactBar.tsx
      product/     ProductCard.tsx  ProductGrid.tsx  Gallery.tsx  SizeChartDialog.tsx  PurchasePanel.tsx  ContactPanel.tsx
      listing/     SortSelect.tsx  Pagination.tsx
      home/        Hero.tsx  TrustStrip.tsx  CategoryTiles.tsx  About.tsx  Process.tsx  ProductBlock.tsx  PromoBanners.tsx  Projects.tsx
      cart/        CartProvider.tsx  CartIcon.tsx  CartTable.tsx  CartSummary.tsx
      checkout/    CheckoutForm.tsx
      quote/       QuoteForm.tsx
```

Unit tests sit next to the file they test as `*.test.ts(x)`.

---

### Task 1: Scaffold, tooling, design tokens, site config

**Files:**
- Create: `.gitignore` (repo root), `storefront/` (generated), `storefront/vitest.config.mts`, `storefront/vitest.setup.ts`, `storefront/playwright.config.ts`, `storefront/e2e/smoke.spec.ts`, `storefront/src/config/site.ts`, `storefront/src/config/commerce.ts`
- Modify: `storefront/src/app/globals.css`, `storefront/src/app/layout.tsx`, `storefront/src/app/page.tsx`, `storefront/next.config.ts`, `storefront/package.json`

**Interfaces:**
- Produces:
  - `SITE` from `@/config/site`: `{ name, tagline, hotlineDisplay, hotlineTel, zaloUrl, facebookUrl, messengerUrl, email, address, mapUrl }`, all `string`, values from spec section 5, declared `as const`.
  - `@/config/commerce`: `PAGE_SIZE = 16`, `SHIPPING_FEE = 30000`, `FREE_SHIP_MIN_ITEMS = 9`, `MAX_LINE_QTY = 99`, `MIN_QUOTE_QTY = 5`, `MAX_QUOTE_QTY = 10000`, `CART_STORAGE_KEY = 'vertex-cart-v1'`.
  - Tailwind theme colours `brand, navy, accent, price, ink, muted, line, soft`; radii `rounded-card` (18px), `rounded-product` (14px); shadow `shadow-card`; utility class `container-site` (max-width 1180px, inline padding 22px, centred).
  - Scripts: `pnpm test` (vitest run), `pnpm test:coverage`, `pnpm e2e`, `pnpm lint`, `pnpm build`.

- [ ] **Step 1: Initialise git and ignore rules** (run in repo root)

```bash
git init
printf '%s\n' 'node_modules/' '.next/' '.playwright-mcp/' '__pycache__/' 'storefront/.data/' 'storefront/coverage/' 'storefront/test-results/' 'storefront/playwright-report/' '.DS_Store' > .gitignore
git add -A && git commit -m "chore: import DeskFlow static template"
```

- [ ] **Step 2: Scaffold the app** (run in repo root)

```bash
pnpm create next-app@16.4.6 storefront --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack --no-cache-components --no-react-compiler --disable-git --yes
cd storefront
pnpm add zod
pnpm add -D vitest @vitest/coverage-v8 @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/user-event @types/node@24 @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 3: Write the failing smoke test** in `e2e/smoke.spec.ts`

```ts
import { expect, test } from '@playwright/test'

test('home renders in Vietnamese with the sample brand', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Vertex Sport/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(font).toContain('Roboto')
})
```

- [ ] **Step 4: Configure the test runners**

`vitest.config.mts`: plugins `tsconfigPaths()` and `react()`; `environment: 'jsdom'`; `setupFiles: ['./vitest.setup.ts']`; `include: ['src/**/*.test.{ts,tsx}']`; coverage provider `v8`, `include: ['src/lib/**', 'src/components/**']`, thresholds 80 for lines, functions, branches, statements.
`vitest.setup.ts`: call RTL `cleanup()` in `afterEach` and `localStorage.clear()`.
`playwright.config.ts`: `testDir: 'e2e'`; `baseURL: 'http://localhost:3100'`; projects `desktop` (1280×800) and `mobile` (Pixel 7); `webServer: { command: 'pnpm build && pnpm start -p 3100', url: 'http://localhost:3100', env: { DATA_DIR: '.data/e2e' }, reuseExistingServer: !process.env.CI }`.
`package.json` scripts: `"test": "vitest run"`, `"test:coverage": "vitest run --coverage"`, `"e2e": "playwright test"`.

- [ ] **Step 5: Run the smoke test to verify it fails**

Run: `pnpm e2e e2e/smoke.spec.ts --project=desktop`
Expected: FAIL on title (`Create Next App`).

- [ ] **Step 6: Implement tokens, layout and config**

`globals.css`: `@import "tailwindcss";` then a `@theme` block defining the colours, radii and shadow from spec section 6 (`--color-brand: #00A0E3;` … `--radius-card: 18px; --radius-product: 14px; --shadow-card: 0 14px 35px rgba(12,41,81,.11);`), `--font-sans: var(--font-roboto), Arial, sans-serif;`, plus `@utility container-site`.
`layout.tsx`: `Roboto` from `next/font/google` with `weight: ['400','500','600','700','900']`, `subsets: ['latin','vietnamese']`, `variable: '--font-roboto'`; `<html lang="vi">`; `metadata.title = { default: 'Vertex Sport – Đồ thể thao thiết kế theo yêu cầu', template: '%s | Vertex Sport' }`.
`page.tsx`: placeholder `<h1>` with `SITE.name` (replaced in Task 4).
`next.config.ts`: `images.remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }]`.
`src/config/site.ts`, `src/config/commerce.ts`: as in Interfaces.

- [ ] **Step 7: Verify**

Run: `pnpm e2e e2e/smoke.spec.ts --project=desktop && pnpm lint`
Expected: 1 passed; lint clean.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: scaffold storefront with design tokens and test tooling"
```

---

### Task 2: Catalogue domain

**Files:**
- Create: `src/lib/format.ts`, `src/lib/text.ts`, `src/lib/catalog/types.ts`, `src/lib/catalog/categories.ts`, `src/lib/catalog/products.ts`, `src/lib/catalog/repository.ts`, `src/lib/catalog/listing-params.ts`
- Test: `src/lib/format.test.ts`, `src/lib/text.test.ts`, `src/lib/catalog/repository.test.ts`, `src/lib/catalog/listing-params.test.ts`

**Interfaces:**
- Consumes: `PAGE_SIZE` from `@/config/commerce`.
- Produces:

```ts
// catalog/types.ts
export type ProductKind = 'ready' | 'custom'
export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free'
export type SortKey = 'popular' | 'newest' | 'price-asc' | 'price-desc'
export interface Category { readonly slug: string; readonly name: string; readonly parentSlug: string | null; readonly image: string }
export interface ProductColor { readonly name: string; readonly image: string }
export interface Product {
  readonly id: string; readonly slug: string; readonly sku: string; readonly name: string
  readonly categorySlug: string; readonly kind: ProductKind
  readonly price: number; readonly compareAtPrice: number | null
  readonly colors: readonly ProductColor[]; readonly sizes: readonly Size[]
  readonly highlights: readonly string[]; readonly description: string
  readonly createdAt: string; readonly popularity: number
}
export interface ProductPage { readonly items: readonly Product[]; readonly total: number; readonly page: number; readonly pageCount: number; readonly from: number; readonly to: number }

// format.ts
export function formatVnd(amount: number): string            // 139000 -> '139.000 ₫' (ordinary space)
export function discountPercent(price: number, compareAtPrice: number | null): number | null
// text.ts
export function normalizeText(input: string): string         // lower-case, strip diacritics, đ->d, collapse spaces, trim
// catalog/repository.ts
export const SORT_LABELS: Readonly<Record<SortKey, string>>  // exact strings from spec section 12
export function getCategories(): readonly Category[]
export function getTopCategories(): readonly Category[]
export function getCategory(slug: string): Category | null
export function getChildCategories(slug: string): readonly Category[]
export function getProduct(slug: string): Product | null
export function getProductById(id: string): Product | null
export function listProducts(opts: { categorySlug?: string; query?: string; sort?: SortKey; page?: number; pageSize?: number }): ProductPage
export function getRelatedProducts(product: Product, limit?: number): readonly Product[]   // same category, excludes itself, default 8
// catalog/listing-params.ts
export function parseListingParams(raw: Record<string, string | string[] | undefined>): { sort: SortKey; page: number; query: string }
```

`listProducts`: a parent category includes its children's products; `query` matches when `normalizeText(name)` contains `normalizeText(query)`; default sort `newest` (by `createdAt` desc); `page` above `pageCount` clamps to the last page; `from`/`to` are 1-based and both `0` when `total` is `0`.

- [ ] **Step 1: Write the failing tests**

```ts
// format.test.ts
expect(formatVnd(139000)).toBe('139.000 ₫')
expect(formatVnd(0)).toBe('0 ₫')
expect(formatVnd(1290000)).toBe('1.290.000 ₫')
expect(discountPercent(129000, 139000)).toBe(7)
expect(discountPercent(169000, 189000)).toBe(11)
expect(discountPercent(139000, null)).toBeNull()
expect(discountPercent(139000, 139000)).toBeNull()   // no badge when not cheaper
expect(discountPercent(150000, 139000)).toBeNull()

// text.test.ts
expect(normalizeText('  Áo Bóng  ĐÁ ')).toBe('ao bong da')
expect(normalizeText('Găng tay đỏ')).toBe('gang tay do')

// repository.test.ts
expect(getCategories()).toHaveLength(14)
expect(listProducts({}).total).toBe(64)
expect(listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).total).toBe(20)
expect(listProducts({ categorySlug: 'ao-bong-da' }).total).toBe(28)          // parent includes children
expect(listProducts({ categorySlug: 'phu-kien' }).total).toBe(16)
const p1 = listProducts({ categorySlug: 'ao-bong-da' })
expect([p1.items.length, p1.pageCount, p1.from, p1.to]).toEqual([16, 2, 1, 16])
const p2 = listProducts({ categorySlug: 'ao-bong-da', page: 2 })
expect([p2.items.length, p2.from, p2.to]).toEqual([12, 17, 28])
expect(listProducts({ categorySlug: 'ao-bong-da', page: 999 }).page).toBe(2) // clamp
const asc = listProducts({ sort: 'price-asc', pageSize: 64 }).items.map((p) => p.price)
expect(asc).toEqual([...asc].sort((a, b) => a - b))
expect(listProducts({ query: 'ao bong da' }).total).toBe(28)                 // no diacritics
expect(listProducts({ query: '  ÁO BÓNG ĐÁ ' }).total).toBe(28)
const none = listProducts({ query: 'zzzz' })
expect([none.total, none.pageCount, none.from, none.to]).toEqual([0, 1, 0, 0])
expect(getProduct('khong-ton-tai')).toBeNull()
expect(getCategory('khong-ton-tai')).toBeNull()
// data integrity
const all = listProducts({ pageSize: 64 }).items
expect(new Set(all.map((p) => p.slug)).size).toBe(64)
expect(all.filter((p) => p.kind === 'ready')).toHaveLength(36)
expect(all.every((p) => Number.isInteger(p.price) && p.price > 0 && p.colors.length >= 1 && p.sizes.length >= 1)).toBe(true)
expect(all.every((p) => getCategory(p.categorySlug) !== null)).toBe(true)
const related = getRelatedProducts(all[0])
expect(related.some((p) => p.id === all[0].id)).toBe(false)
expect(related.length).toBeLessThanOrEqual(8)
expect(Object.values(SORT_LABELS)).toContain('Sắp xếp theo giá: thấp đến cao')

// listing-params.test.ts
expect(parseListingParams({})).toEqual({ sort: 'newest', page: 1, query: '' })
expect(parseListingParams({ sort: 'xyz', page: 'abc' })).toEqual({ sort: 'newest', page: 1, query: '' })
expect(parseListingParams({ page: '-3' }).page).toBe(1)
expect(parseListingParams({ page: '2.7' }).page).toBe(1)
expect(parseListingParams({ sort: ['price-desc', 'newest'], page: ['2'] })).toMatchObject({ sort: 'price-desc', page: 2 })
expect(parseListingParams({ q: '  ao   bong ' }).query).toBe('ao bong')
expect(parseListingParams({ q: 'x'.repeat(500) }).query).toHaveLength(100)   // capped
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test src/lib/format.test.ts src/lib/text.test.ts src/lib/catalog`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`categories.ts`: the 14 categories from spec section 7 as a frozen array; `image` is `https://picsum.photos/seed/<slug>/800/400`.
Naming rule: every product name starts with its category's noun phrase (`Áo bóng đá không logo Tia Chớp`, `Áo cầu lông …`, `Giày …`, `Bóng …`); only the 28 football shirts contain the phrase `Áo bóng đá`.
`products.ts`: build the 64 products with a small pure generator per category (design names are invented, e.g. `Tia Chớp`, `Sóng Biển`, `Rồng Lửa`). Fixed rules: `ao-bong-da-khong-logo` → `ready`, price `129000`, compareAt `139000`, 6 colours; `ao-bong-ro` → price `169000`, compareAt `189000`; other shirt categories → `custom`, price `139000`, compareAt `null`; accessories → `ready`, size `['Free']`, prices between `45000` and `890000`. Shirts use sizes `S`–`XXL`. `id` = `sku`; `createdAt` distinct per product so `newest` is deterministic; colour image `https://picsum.photos/seed/<slug>-<n>/800/800`.
`text.ts`: `normalize('NFD')`, strip `\p{Diacritic}`, replace `đ`.
`formatVnd`: `Intl.NumberFormat('vi-VN').format(amount) + ' ₫'`.

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test src/lib/format.test.ts src/lib/text.test.ts src/lib/catalog`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add catalogue domain with listing, search and formatting"
```

---

### Task 3: Site shell (top bar, header, footer, contacts)

**Files:**
- Create: `src/config/navigation.ts`, `src/components/ui/Button.tsx`, `src/components/ui/SectionHead.tsx`, `src/components/layout/TopBar.tsx`, `Header.tsx`, `MobileMenu.tsx`, `Footer.tsx`, `CtaBand.tsx`, `FloatingContacts.tsx`, `MobileContactBar.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/components/layout/Header.test.tsx`, `MobileMenu.test.tsx`, `Footer.test.tsx`, `src/components/ui/Button.test.tsx`

**Interfaces:**
- Consumes: `SITE`; `getCategory` (to build hrefs).
- Produces:

```ts
// config/navigation.ts
export interface NavItem { readonly label: string; readonly href: string; readonly children?: readonly NavItem[] }
export const MAIN_NAV: readonly NavItem[]     // spec section 9 item 2, hrefs '/danh-muc/<slug>' and '/tin-tuc'
export const POLICY_LINKS: readonly NavItem[] // 4 anchors: '/chinh-sach#bao-mat', '#giao-nhan', '#doi-tra', '#thanh-toan'

// ui/Button.tsx — renders <a> via next/link when href is given, else <button>
export function Button(props: { variant: 'red' | 'blue' | 'white'; href?: string; type?: 'button' | 'submit'; disabled?: boolean; onClick?: () => void; children: React.ReactNode; className?: string }): JSX.Element
// ui/SectionHead.tsx
export function SectionHead(props: { kicker?: string; title: string; subtitle?: string; align?: 'left' | 'center' }): JSX.Element
// layout/Header.tsx — server component; accepts the cart icon as a slot so Task 7 can plug it in
export function Header(props: { cartSlot?: React.ReactNode }): JSX.Element
// layout/MobileMenu.tsx — 'use client'
export function MobileMenu(props: { items: readonly NavItem[] }): JSX.Element
export function TopBar(): JSX.Element; export function Footer(): JSX.Element; export function CtaBand(): JSX.Element
export function FloatingContacts(): JSX.Element; export function MobileContactBar(): JSX.Element
```

Behaviour: header is `position: sticky; top: 0`, white, 78px tall on desktop. Desktop dropdowns open on hover and on keyboard focus (`:focus-within`). Search is a `<form action="/tim-kiem" method="get">` with input `name="q"`, placeholder `Tìm kiếm sản phẩm`, submit label `Tìm`. `MobileMenu`: button `aria-label="Mở menu"` with `aria-expanded`; opens an off-canvas `<nav>` whose links are rendered only while it is open; closes on Esc, on the `Đóng menu` button and on link click. `MobileContactBar` shows only below 850px with the five labels from spec section 9 item 13; `FloatingContacts` only at 850px and above. External links get `rel="noopener noreferrer"` and `target="_blank"`. `layout.tsx` renders `TopBar`, `Header`, `{children}` in `<main>`, `CtaBand`, `Footer`, `FloatingContacts`, `MobileContactBar`, with bottom padding on mobile so the bar never covers content.

- [ ] **Step 1: Write the failing tests**

```tsx
// Header.test.tsx
render(<Header />)
for (const label of ['Áo bóng đá', 'Áo cầu lông', 'Pickleball', 'Bóng chuyền', 'Bóng rổ', 'Polo', 'Phụ kiện', 'Tin tức'])
  expect(screen.getAllByRole('link', { name: new RegExp(label) }).length).toBeGreaterThan(0)
expect(screen.getByRole('link', { name: 'Không logo' })).toHaveProperty('pathname', '/danh-muc/ao-bong-da-khong-logo')
expect(screen.getByRole('link', { name: 'NHẬN BÁO GIÁ' })).toHaveProperty('pathname', '/bao-gia')
expect(screen.getByPlaceholderText('Tìm kiếm sản phẩm').getAttribute('name')).toBe('q')

// MobileMenu.test.tsx
const user = userEvent.setup(); render(<MobileMenu items={MAIN_NAV} />)
const toggle = screen.getByRole('button', { name: 'Mở menu' })
expect(toggle.getAttribute('aria-expanded')).toBe('false')
await user.click(toggle)
expect(toggle.getAttribute('aria-expanded')).toBe('true')
expect(screen.getByRole('link', { name: 'Giày' })).toBeTruthy()
await user.keyboard('{Escape}')
expect(toggle.getAttribute('aria-expanded')).toBe('false')

// Footer.test.tsx
render(<Footer />)
expect(screen.getByText('CHÍNH SÁCH MUA HÀNG')).toBeTruthy()
expect(screen.getByText('THÔNG TIN LIÊN HỆ')).toBeTruthy()
expect(screen.getByRole('link', { name: /0900 000 000/ }).getAttribute('href')).toBe('tel:0900000000')
expect(screen.getByText(/© 2026 Vertex Sport/)).toBeTruthy()
expect(document.body.textContent).not.toMatch(/enzo/i)

// Button.test.tsx
render(<Button variant="red" href="/bao-gia">A</Button>); expect(screen.getByRole('link', { name: 'A' })).toBeTruthy()
render(<Button variant="blue" disabled>B</Button>); expect(screen.getByRole('button', { name: 'B' })).toHaveProperty('disabled', true)
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/components/layout src/components/ui` → FAIL, modules not found.
- [ ] **Step 3: Implement the components and wire `layout.tsx`** as described under Behaviour.
- [ ] **Step 4: Run to verify pass** — `pnpm test src/components/layout src/components/ui` → PASS.
- [ ] **Step 5: Add to `e2e/smoke.spec.ts` and run**

```ts
test('header stays visible while scrolling', async ({ page }) => {
  await page.goto('/'); await page.mouse.wheel(0, 2000)
  await expect(page.getByRole('banner')).toBeInViewport()
})
test('mobile shows the contact bar', async ({ page, isMobile }) => {
  test.skip(!isMobile); await page.goto('/')
  await expect(page.getByRole('link', { name: 'Chat Zalo' })).toBeVisible()
})
```

Run: `pnpm e2e e2e/smoke.spec.ts` → all passed on both projects.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add site shell with header, footer and contact shortcuts"`

---

### Task 4: Product card and home page

**Files:**
- Create: `src/components/ui/Price.tsx`, `src/components/product/ProductCard.tsx`, `ProductGrid.tsx`, `src/components/home/Hero.tsx`, `TrustStrip.tsx`, `CategoryTiles.tsx`, `About.tsx`, `Process.tsx`, `ProductBlock.tsx`, `PromoBanners.tsx`, `Projects.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/components/product/ProductCard.test.tsx`, `src/components/ui/Price.test.tsx`, `src/components/home/ProductBlock.test.tsx`, `e2e/home.spec.ts`

**Interfaces:**
- Consumes: `Product`, `listProducts`, `getCategory`, `getTopCategories`, `formatVnd`, `discountPercent`, `Button`, `SectionHead`.
- Produces:

```ts
export function Price(props: { price: number; compareAtPrice: number | null; kind: ProductKind; size?: 'card' | 'detail' }): JSX.Element
export function ProductCard(props: { product: Product }): JSX.Element     // <article> wrapping one link to /san-pham/<slug>
export function ProductGrid(props: { products: readonly Product[] }): JSX.Element   // 4 cols, 2 cols at <=849px, gap 16px
export function ProductBlock(props: { categorySlug: string; subtitle: string }): JSX.Element | null   // null when category unknown or empty
```

`Price` renders `<del>` for the old price and `<ins>` for the current one, with visually hidden text `Giá gốc:` / `Giá hiện tại:`; `custom` products prefix the current price with `Từ `. `ProductCard` per spec section 10: `next/image` square, `alt` = product name, badge `-N%` only when `discountPercent` is non-null, at most 6 colour thumbnails (decorative, `alt=""`), name clamped to 2 lines. Home section order and copy per spec section 9; the six `ProductBlock`s use slugs `ao-bong-da-khong-logo, ao-bong-da-thiet-ke, ao-cau-long, ao-pickleball, ao-bong-chuyen, ao-bong-ro`, `PromoBanners` sits after the second, and the wrapper has `id="san-pham"`. Body copy not pinned by the spec is the implementer's own Vietnamese sample text.

- [ ] **Step 1: Write the failing tests**

```tsx
// Price.test.tsx
render(<Price price={129000} compareAtPrice={139000} kind="ready" />)
expect(document.querySelector('del')?.textContent).toContain('139.000 ₫')
expect(document.querySelector('ins')?.textContent).toContain('129.000 ₫')
cleanup(); render(<Price price={139000} compareAtPrice={null} kind="custom" />)
expect(document.querySelector('del')).toBeNull()
expect(screen.getByText(/Từ\s+139\.000 ₫/)).toBeTruthy()

// ProductCard.test.tsx
const ready = getProduct(listProducts({ categorySlug: 'ao-bong-da-khong-logo' }).items[0].slug)!
render(<ProductCard product={ready} />)
expect(screen.getByRole('link')).toHaveProperty('pathname', `/san-pham/${ready.slug}`)
expect(screen.getByRole('img', { name: ready.name })).toBeTruthy()
expect(screen.getByText('-7%')).toBeTruthy()
expect(document.querySelectorAll('[data-testid="color-thumb"]').length).toBe(6)
cleanup(); render(<ProductCard product={{ ...ready, compareAtPrice: null }} />)
expect(screen.queryByText(/-\d+%/)).toBeNull()
cleanup(); render(<ProductCard product={{ ...ready, name: 'Áo '.repeat(80) }} />)   // very long name
expect(screen.getByRole('heading').className).toContain('line-clamp-2')

// ProductBlock.test.tsx
render(<ProductBlock categorySlug="ao-cau-long" subtitle="x" />)
expect(screen.getAllByRole('article')).toHaveLength(4)
expect(screen.getByRole('link', { name: /XEM TẤT CẢ/ })).toHaveProperty('pathname', '/danh-muc/ao-cau-long')
const { container } = render(<ProductBlock categorySlug="khong-ton-tai" subtitle="x" />)
expect(container.innerHTML).toBe('')
```

```ts
// e2e/home.spec.ts
test('home shows every section in order', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('THIẾT KẾ THEO YÊU CẦU')
  const titles = ['CHỌN MÔN THỂ THAO CỦA BẠN', 'ĐƠN GIẢN – NHANH CHÓNG', 'BẠN ĐANG CẦN ĐỒNG PHỤC CHO ĐỘI?']
  for (const t of titles) await expect(page.getByRole('heading', { name: t })).toBeVisible()
  await expect(page.locator('#san-pham article')).toHaveCount(24)
  await page.getByRole('link', { name: 'XEM MẪU ÁO' }).click()
  await expect(page.locator('#san-pham')).toBeInViewport()
})
test('home has no horizontal scroll', async ({ page }) => {
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/components/product src/components/ui/Price.test.tsx src/components/home` → FAIL.
- [ ] **Step 3: Implement the components and `page.tsx`.**
- [ ] **Step 4: Run to verify pass** — same vitest command → PASS; `pnpm e2e e2e/home.spec.ts` → passed on both projects.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add product card and home page sections"`

---

### Task 5: Category listing and search

**Files:**
- Create: `src/components/ui/Breadcrumb.tsx`, `src/components/listing/SortSelect.tsx`, `src/components/listing/Pagination.tsx`, `src/app/danh-muc/[slug]/page.tsx`, `src/app/tim-kiem/page.tsx`, `src/app/not-found.tsx`
- Test: `src/components/listing/Pagination.test.tsx`, `SortSelect.test.tsx`, `src/components/ui/Breadcrumb.test.tsx`, `e2e/browse.spec.ts`

**Interfaces:**
- Consumes: `listProducts`, `getCategory`, `parseListingParams`, `SORT_LABELS`, `ProductGrid`, `ProductPage`.
- Produces:

```ts
export function Breadcrumb(props: { items: readonly { label: string; href?: string }[] }): JSX.Element   // <nav aria-label="Breadcrumb">, last item aria-current="page"
export function SortSelect(props: { value: SortKey }): JSX.Element        // 'use client'; on change router.push with ?sort=, drops page
export function Pagination(props: { page: number; pageCount: number; hrefFor: (page: number) => string }): JSX.Element | null   // null when pageCount <= 1
export function buildPageItems(page: number, pageCount: number): readonly (number | 'gap')[]   // exported from Pagination.tsx
```

Listing page: `await params` and `await searchParams`; unknown slug → `notFound()`; `generateStaticParams` returns every category slug; `generateMetadata` title = category name. Count line `Hiển thị {from}–{to} của {total} kết quả`. A parent category shows child category chips above the grid. An empty category shows `Chưa có sản phẩm trong danh mục này.` Search page: empty `q` shows `Nhập từ khoá để tìm sản phẩm.` and no grid; no match shows `Không tìm thấy sản phẩm cho “{q}”.` (React escapes `q`); otherwise the same grid, count line and pagination with `q` preserved in links. `not-found.tsx`: heading `Không tìm thấy trang`, a link home and a link `/bao-gia`.

- [ ] **Step 1: Write the failing tests**

```tsx
// Pagination.test.tsx
expect(buildPageItems(1, 2)).toEqual([1, 2])
expect(buildPageItems(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10])
expect(buildPageItems(1, 1)).toEqual([1])
const { container } = render(<Pagination page={1} pageCount={1} hrefFor={(p) => `?page=${p}`} />)
expect(container.innerHTML).toBe('')
render(<Pagination page={1} pageCount={2} hrefFor={(p) => `/x?page=${p}`} />)
expect(screen.getByRole('link', { name: '2' }).getAttribute('href')).toBe('/x?page=2')
expect(screen.getByText('1').getAttribute('aria-current')).toBe('page')
expect(screen.getByRole('link', { name: 'Trang sau' })).toBeTruthy()
expect(screen.queryByRole('link', { name: 'Trang trước' })).toBeNull()

// SortSelect.test.tsx  (mock next/navigation: useRouter().push, usePathname -> '/danh-muc/ao-bong-da', useSearchParams -> 'page=2&sort=newest')
render(<SortSelect value="newest" />)
expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(Object.values(SORT_LABELS))
await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sắp xếp' }), 'price-asc')
expect(push).toHaveBeenCalledWith('/danh-muc/ao-bong-da?sort=price-asc')   // page dropped

// Breadcrumb.test.tsx
render(<Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Áo bóng đá' }]} />)
expect(screen.getByText('Áo bóng đá').getAttribute('aria-current')).toBe('page')
```

```ts
// e2e/browse.spec.ts
test('listing paginates and sorts', async ({ page }) => {
  await page.goto('/danh-muc/ao-bong-da')
  await expect(page.getByText('Hiển thị 1–16 của 28 kết quả')).toBeVisible()
  await expect(page.locator('main article')).toHaveCount(16)
  await page.getByRole('link', { name: '2', exact: true }).click()
  await expect(page.getByText('Hiển thị 17–28 của 28 kết quả')).toBeVisible()
  await page.getByRole('combobox', { name: 'Sắp xếp' }).selectOption('price-asc')
  await expect(page).toHaveURL(/sort=price-asc/); await expect(page).not.toHaveURL(/page=/)
})
test('garbage listing params fall back instead of failing', async ({ page }) => {
  const res = await page.goto('/danh-muc/ao-bong-da?page=abc&sort=xyz')
  expect(res?.status()).toBe(200)
  await expect(page.getByText('Hiển thị 1–16 của 28 kết quả')).toBeVisible()
  await page.goto('/danh-muc/ao-bong-da?page=999')
  await expect(page.getByText('Hiển thị 17–28 của 28 kết quả')).toBeVisible()
})
test('unknown category is a 404 page', async ({ page }) => {
  const res = await page.goto('/danh-muc/khong-ton-tai')
  expect(res?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible()
})
test('search works without diacritics and handles empty and hostile input', async ({ page }) => {
  await page.goto('/'); await page.getByPlaceholder('Tìm kiếm sản phẩm').fill('ao bong da'); await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/tim-kiem\?q=ao\+bong\+da/)
  await expect(page.getByText('Hiển thị 1–16 của 28 kết quả')).toBeVisible()
  await page.goto('/tim-kiem?q=')
  await expect(page.getByText('Nhập từ khoá để tìm sản phẩm.')).toBeVisible()
  await expect(page.locator('main article')).toHaveCount(0)
  await page.goto('/tim-kiem?q=' + encodeURIComponent('<img src=x onerror=alert(1)>'))
  await expect(page.getByText(/Không tìm thấy sản phẩm cho/)).toBeVisible()
  expect(await page.locator('main img[src="x"]').count()).toBe(0)
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/components/listing src/components/ui/Breadcrumb.test.tsx` → FAIL.
- [ ] **Step 3: Implement components and the three route files.**
- [ ] **Step 4: Run to verify pass** — vitest command → PASS; `pnpm e2e e2e/browse.spec.ts` → passed.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add category listing, search and 404 page"`

---

### Task 6: Product detail page

**Files:**
- Create: `src/config/size-chart.ts`, `src/components/product/Gallery.tsx`, `SizeChartDialog.tsx`, `ContactPanel.tsx`, `src/app/san-pham/[slug]/page.tsx`
- Test: `src/components/product/Gallery.test.tsx`, `SizeChartDialog.test.tsx`, `ContactPanel.test.tsx`, `e2e/product.spec.ts`

**Interfaces:**
- Consumes: `getProduct`, `getRelatedProducts`, `getCategory`, `Price`, `Breadcrumb`, `ProductGrid`, `Button`, `SITE`.
- Produces:

```ts
// config/size-chart.ts
export interface SizeRow { readonly size: string; readonly a: string; readonly b: string }
export interface SizeTable { readonly id: 'nam' | 'nu' | 'tre-em'; readonly label: string; readonly columns: readonly [string, string, string]; readonly rows: readonly SizeRow[] }
export const SIZE_TABLES: readonly SizeTable[]   // labels 'Size nam', 'Size nữ', 'Size trẻ em'; sample rows
// product/Gallery.tsx — 'use client'; controlled so the purchase panel (Task 7) can drive it
export function Gallery(props: { name: string; colors: readonly ProductColor[]; activeIndex: number; onSelect: (index: number) => void }): JSX.Element
export function SizeChartDialog(): JSX.Element   // 'use client'; trigger button 'Mở bảng size' + native <dialog>
export function ContactPanel(props: { product: Product }): JSX.Element
```

`Gallery`: main image `alt="{name} – {colour}"`; thumbnails are buttons with `aria-label="Màu {colour}"` and `aria-pressed`. `SizeChartDialog`: `<dialog>` opened with `showModal()` (Esc closes natively), title `Bảng size thể thao`, three tabs (`role="tab"`), a `Đóng` button, note `Nếu chiều cao hoặc cân nặng ở giữa hai size, hãy chọn size lớn hơn.` `ContactPanel`: `LIÊN HỆ ĐẶT HÀNG` → `SITE.hotlineTel`, `TƯ VẤN THIẾT KẾ` → `SITE.zaloUrl`, link `Nhận báo giá cho mẫu này` → `/bao-gia?san-pham=<slug>`. Page: unknown slug → `notFound()`; `generateStaticParams` for all 64; `generateMetadata` title = product name; layout and blocks per spec section 11; shows `SKU:` and category link; block heading `ƯU ĐÃI KHI MUA HÀNG` with 4 lines; heading `Sản phẩm tương tự`. In this task the page renders `ContactPanel` for `custom` products and a placeholder `<div data-testid="purchase-slot" />` for `ready` ones, inside a small client wrapper `ProductView` (in the page folder) that owns `activeIndex`.

- [ ] **Step 1: Write the failing tests**

```tsx
// Gallery.test.tsx
const colors = [{ name: 'Đỏ', image: 'https://picsum.photos/seed/a/800/800' }, { name: 'Xanh', image: 'https://picsum.photos/seed/b/800/800' }]
const onSelect = vi.fn(); render(<Gallery name="Áo A" colors={colors} activeIndex={0} onSelect={onSelect} />)
expect(screen.getByRole('img', { name: 'Áo A – Đỏ' })).toBeTruthy()
expect(screen.getByRole('button', { name: 'Màu Đỏ' }).getAttribute('aria-pressed')).toBe('true')
await userEvent.click(screen.getByRole('button', { name: 'Màu Xanh' })); expect(onSelect).toHaveBeenCalledWith(1)

// SizeChartDialog.test.tsx  (stub HTMLDialogElement.prototype.showModal/close to toggle the `open` attribute)
render(<SizeChartDialog />)
await userEvent.click(screen.getByRole('button', { name: 'Mở bảng size' }))
expect(screen.getByRole('dialog').hasAttribute('open')).toBe(true)
expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Size nam', 'Size nữ', 'Size trẻ em'])
await userEvent.click(screen.getByRole('tab', { name: 'Size nữ' }))
expect(screen.getByRole('tab', { name: 'Size nữ' }).getAttribute('aria-selected')).toBe('true')
await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
expect(screen.getByRole('dialog', { hidden: true }).hasAttribute('open')).toBe(false)

// ContactPanel.test.tsx
const custom = listProducts({ categorySlug: 'ao-cau-long' }).items[0]; render(<ContactPanel product={custom} />)
expect(screen.getByRole('link', { name: 'LIÊN HỆ ĐẶT HÀNG' }).getAttribute('href')).toBe('tel:0900000000')
expect(screen.getByRole('link', { name: 'TƯ VẤN THIẾT KẾ' }).getAttribute('href')).toBe('https://zalo.me/0900000000')
expect(screen.getByRole('link', { name: 'Nhận báo giá cho mẫu này' }).getAttribute('href')).toBe(`/bao-gia?san-pham=${custom.slug}`)
expect(screen.queryByRole('button', { name: /GIỎ/ })).toBeNull()
```

```ts
// e2e/product.spec.ts
test('custom product offers contact, not cart', async ({ page }) => {
  await page.goto('/danh-muc/ao-cau-long'); await page.locator('main article a').first().click()
  await expect(page).toHaveURL(/\/san-pham\//)
  await expect(page.getByRole('link', { name: 'LIÊN HỆ ĐẶT HÀNG' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'THÊM VÀO GIỎ' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Mở bảng size' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Sản phẩm tương tự' })).toBeVisible()
})
test('unknown product is a 404 page', async ({ page }) => {
  expect((await page.goto('/san-pham/khong-ton-tai'))?.status()).toBe(404)
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/components/product` → new tests FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify pass** — vitest → PASS; `pnpm e2e e2e/product.spec.ts` → passed.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add product detail page with gallery, size chart and contact panel"`

---

### Task 7: Cart

**Files:**
- Create: `src/lib/cart/types.ts`, `reducer.ts`, `storage.ts`, `totals.ts`, `src/components/cart/CartProvider.tsx`, `CartIcon.tsx`, `CartTable.tsx`, `CartSummary.tsx`, `src/components/product/PurchasePanel.tsx`, `src/app/gio-hang/page.tsx`
- Modify: `src/app/layout.tsx` (wrap in `CartProvider`, pass `<CartIcon />` to `Header`), `src/app/san-pham/[slug]/` `ProductView` (replace `purchase-slot` with `PurchasePanel`)
- Test: `src/lib/cart/reducer.test.ts`, `storage.test.ts`, `totals.test.ts`, `src/components/cart/CartProvider.test.tsx`, `src/components/product/PurchasePanel.test.tsx`, `e2e/cart.spec.ts`

**Interfaces:**
- Consumes: `getProductById`, `Product`, `Size`, commerce constants, `formatVnd`.
- Produces:

```ts
// cart/types.ts
export interface CartLine { readonly productId: string; readonly size: Size; readonly color: string; readonly quantity: number }
export type CartAction =
  | { type: 'add'; line: CartLine } | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string } | { type: 'clear' } | { type: 'hydrate'; lines: readonly CartLine[] }
export function lineKey(line: Pick<CartLine, 'productId' | 'size' | 'color'>): string   // `${productId}|${size}|${color}`
// cart/reducer.ts
export function cartReducer(state: readonly CartLine[], action: CartAction): readonly CartLine[]
// cart/storage.ts
export function sanitizeLines(raw: unknown): readonly CartLine[]
export function loadCart(storage: Pick<Storage, 'getItem'>): readonly CartLine[]
export function saveCart(storage: Pick<Storage, 'setItem'>, lines: readonly CartLine[]): void   // swallows quota errors after console.warn
// cart/totals.ts
export interface PricedLine extends CartLine { readonly key: string; readonly product: Product; readonly lineTotal: number }
export interface CartTotals { readonly lines: readonly PricedLine[]; readonly itemCount: number; readonly subtotal: number; readonly shipping: number; readonly total: number }
export function computeTotals(lines: readonly CartLine[]): CartTotals
// components/cart/CartProvider.tsx — 'use client'
export function CartProvider(props: { children: React.ReactNode }): JSX.Element
export function useCart(): { lines: readonly CartLine[]; totals: CartTotals; hydrated: boolean; add(line: CartLine): void; setQuantity(key: string, quantity: number): void; remove(key: string): void; clear(): void }
export function PurchasePanel(props: { product: Product; activeColorIndex: number; onColorChange: (index: number) => void }): JSX.Element
```

Rules: `add` merges into an existing line with the same key and clamps the sum to `MAX_LINE_QTY`; `setQuantity` clamps to `1..MAX_LINE_QTY` and ignores non-integers; unknown keys are no-ops returning the same array reference. `sanitizeLines` keeps only lines whose product exists, is `ready`, has that size and colour, and whose quantity is an integer in range; duplicate keys are merged. `computeTotals`: `shipping` is `0` when `itemCount >= FREE_SHIP_MIN_ITEMS` or the cart is empty, else `SHIPPING_FEE`. `CartProvider` hydrates in an effect (server render and first client render both show an empty cart) and saves on every change after hydration. `CartIcon`: link to `/gio-hang`, `aria-label="Giỏ hàng, {n} sản phẩm"`, count badge hidden at `0`. `PurchasePanel`: colour and size radio groups (size preselected only when the product has a single size), quantity stepper 1–99, `THÊM VÀO GIỎ` (shows `Đã thêm vào giỏ hàng` in an `aria-live="polite"` region), `MUA NGAY` (add then `router.push('/thanh-toan')`); pressing either without a size shows `Vui lòng chọn size.` and adds nothing. Cart page: empty state `Giỏ hàng của bạn đang trống.` with a link to `/danh-muc/ao-bong-da-khong-logo`; otherwise table (image, name, màu, size, đơn giá, stepper, thành tiền, `Xoá`), summary (`Tạm tính`, `Phí giao hàng` showing `Miễn phí` at 0, `Tổng cộng`), hint `Mua thêm {n} sản phẩm để được miễn phí giao hàng.` while below the threshold, and `TIẾN HÀNH THANH TOÁN` → `/thanh-toan`.

- [ ] **Step 1: Write the failing tests**

```ts
// reducer.test.ts   (A = first khong-logo product; line(q) = { productId: A.id, size: 'M', color: A.colors[0].name, quantity: q })
const s1 = cartReducer([], { type: 'add', line: line(2) }); expect(s1).toEqual([line(2)])
const s2 = cartReducer(s1, { type: 'add', line: line(3) }); expect(s2).toEqual([line(5)]); expect(s1).toEqual([line(2)])   // no mutation
expect(cartReducer(s1, { type: 'add', line: { ...line(1), size: 'L' } })).toHaveLength(2)
expect(cartReducer([line(98)], { type: 'add', line: line(5) })[0].quantity).toBe(99)
const k = lineKey(line(1))
expect(cartReducer(s1, { type: 'setQuantity', key: k, quantity: 0 })[0].quantity).toBe(1)
expect(cartReducer(s1, { type: 'setQuantity', key: k, quantity: 500 })[0].quantity).toBe(99)
expect(cartReducer(s1, { type: 'setQuantity', key: k, quantity: 2.5 })).toBe(s1)
expect(cartReducer(s1, { type: 'remove', key: 'nope' })).toBe(s1)
expect(cartReducer(s1, { type: 'remove', key: k })).toEqual([])
expect(cartReducer(s1, { type: 'clear' })).toEqual([])

// storage.test.ts   (C = a custom product)
const store = (v: string | null) => ({ getItem: () => v })
expect(loadCart(store(null))).toEqual([])
expect(loadCart(store('{not json'))).toEqual([])
expect(loadCart(store('{"a":1}'))).toEqual([])
expect(loadCart(store(JSON.stringify([line(2), { productId: 'GONE', size: 'M', color: 'x', quantity: 1 }])))).toEqual([line(2)])
expect(loadCart(store(JSON.stringify([{ ...line(1), productId: C.id }])))).toEqual([])          // custom product
expect(loadCart(store(JSON.stringify([{ ...line(1), size: 'XXXL' }])))).toEqual([])
expect(loadCart(store(JSON.stringify([{ ...line(1), quantity: -4 }, { ...line(1), quantity: 'x' }])))).toEqual([])
expect(loadCart(store(JSON.stringify([line(60), line(60)])))).toEqual([line(99)])                // merged and clamped
expect(() => saveCart({ setItem: () => { throw new Error('quota') } }, [line(1)])).not.toThrow()

// totals.test.ts
expect(computeTotals([])).toMatchObject({ itemCount: 0, subtotal: 0, shipping: 0, total: 0 })
expect(computeTotals([line(2)])).toMatchObject({ itemCount: 2, subtotal: 258000, shipping: 30000, total: 288000 })
expect(computeTotals([line(8)]).shipping).toBe(30000)
expect(computeTotals([line(9)])).toMatchObject({ subtotal: 1161000, shipping: 0, total: 1161000 })
```

```tsx
// CartProvider.test.tsx
localStorage.setItem('vertex-cart-v1', '{broken'); render(<CartProvider><Probe /></CartProvider>)   // Probe prints itemCount, has an add button
await screen.findByText('items:0')                                    // corrupt storage -> empty, no crash
await userEvent.click(screen.getByRole('button', { name: 'add' })); await screen.findByText('items:1')
expect(JSON.parse(localStorage.getItem('vertex-cart-v1')!)).toHaveLength(1)
expect(() => render(<Probe />)).toThrow(/CartProvider/)               // useCart outside provider

// PurchasePanel.test.tsx   (wrapped in CartProvider; next/navigation mocked)
await userEvent.click(screen.getByRole('button', { name: 'THÊM VÀO GIỎ' }))
expect(screen.getByText('Vui lòng chọn size.')).toBeTruthy(); expect(localStorage.getItem('vertex-cart-v1') ?? '[]').toBe('[]')
await userEvent.click(screen.getByRole('radio', { name: 'L' }))
await userEvent.click(screen.getByRole('button', { name: 'Tăng số lượng' }))
await userEvent.click(screen.getByRole('button', { name: 'THÊM VÀO GIỎ' }))
expect(await screen.findByText('Đã thêm vào giỏ hàng')).toBeTruthy()
expect(JSON.parse(localStorage.getItem('vertex-cart-v1')!)[0]).toMatchObject({ size: 'L', quantity: 2 })
await userEvent.click(screen.getByRole('button', { name: 'MUA NGAY' })); expect(push).toHaveBeenCalledWith('/thanh-toan')
```

```ts
// e2e/cart.spec.ts
test('add a ready product, edit and persist the cart', async ({ page }) => {
  await page.goto('/danh-muc/ao-bong-da-khong-logo'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check()
  await page.getByRole('button', { name: 'THÊM VÀO GIỎ' }).click()
  await expect(page.getByRole('link', { name: 'Giỏ hàng, 1 sản phẩm' })).toBeVisible()
  await page.getByRole('link', { name: /Giỏ hàng/ }).click()
  await expect(page.getByText('Mua thêm 8 sản phẩm để được miễn phí giao hàng.')).toBeVisible()
  await page.getByRole('button', { name: 'Tăng số lượng' }).click()
  await expect(page.getByTestId('cart-total')).toHaveText('288.000 ₫')
  await page.reload(); await expect(page.getByTestId('cart-total')).toHaveText('288.000 ₫')
  await page.getByRole('button', { name: 'Xoá' }).click()
  await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
})
test('a corrupt stored cart does not break the site', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vertex-cart-v1', '{{{'))
  await page.goto('/gio-hang'); await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/lib/cart src/components/cart src/components/product/PurchasePanel.test.tsx` → FAIL.
- [ ] **Step 3: Implement** (`sanitizeLines` uses a zod schema for the line shape, then the catalogue checks).
- [ ] **Step 4: Run to verify pass** — vitest → PASS; `pnpm e2e e2e/cart.spec.ts` → passed.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add persistent cart and purchase panel for ready-stock products"`

---

### Task 8: Orders API, checkout and success page

**Files:**
- Create: `src/lib/http/api-response.ts`, `rate-limit.ts`, `same-origin.ts`, `client.ts`, `src/lib/storage/jsonl-store.ts`, `src/lib/orders/schema.ts`, `code.ts`, `service.ts`, `repository.ts`, `src/app/api/orders/route.ts`, `src/components/checkout/CheckoutForm.tsx`, `src/app/thanh-toan/page.tsx`, `src/app/dat-hang-thanh-cong/[code]/page.tsx`
- Test: `src/lib/http/rate-limit.test.ts`, `same-origin.test.ts`, `src/lib/storage/jsonl-store.test.ts`, `src/lib/orders/schema.test.ts`, `code.test.ts`, `service.test.ts`, `src/app/api/orders/route.test.ts`, `src/components/checkout/CheckoutForm.test.tsx`, `e2e/checkout.spec.ts`

**Interfaces:**
- Consumes: `CartLine`, `computeTotals`, `sanitizeLines`, `useCart`, `formatVnd`.
- Produces:

```ts
// http/api-response.ts
export interface ApiError { readonly code: 'VALIDATION' | 'FORBIDDEN' | 'RATE_LIMITED' | 'NOT_FOUND' | 'INTERNAL'; readonly message: string; readonly fields?: Readonly<Record<string, string>> }
export type ApiResponse<T> = { readonly success: true; readonly data: T; readonly error: null } | { readonly success: false; readonly data: null; readonly error: ApiError }
export function ok<T>(data: T, status?: number): Response
export function fail(status: number, error: ApiError, headers?: Record<string, string>): Response
// http/rate-limit.ts — in-memory fixed window
export function createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }): (key: string) => { allowed: boolean; retryAfterSec: number }
export function clientKey(request: Request): string            // first x-forwarded-for entry, else 'unknown'
// http/same-origin.ts
export function isSameOrigin(request: Request): boolean        // Origin header present and its host equals the Host header
// http/client.ts — browser helper; never throws, maps network failure to an INTERNAL error
export function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>>
// storage/jsonl-store.ts
export function dataPath(fileName: string): string             // join(process.env.DATA_DIR ?? '.data', fileName)
export function appendRecord(filePath: string, record: unknown): Promise<void>   // mkdir -p, append one JSON line
export function readRecords<T>(filePath: string): Promise<readonly T[]>          // [] when missing; skips unparsable lines
// orders/schema.ts
export const orderInputSchema: z.ZodType<OrderInput>
export interface OrderInput { customer: { name: string; phone: string; email?: string; province: string; address: string; note?: string }; payment: 'cod' | 'bank'; lines: CartLine[] }
export interface Order { readonly code: string; readonly createdAt: string; readonly customer: OrderInput['customer']; readonly payment: 'cod' | 'bank'; readonly lines: readonly { productId: string; name: string; size: string; color: string; quantity: number; unitPrice: number; lineTotal: number }[]; readonly subtotal: number; readonly shipping: number; readonly total: number }
export type PublicOrder = Omit<Order, 'customer'>
// orders/code.ts
export function generateOrderCode(now: Date, random?: (n: number) => Uint8Array): string   // 'VS-YYMMDD-XXXXXXXX', alphabet A-Z2-9
export const ORDER_CODE_PATTERN: RegExp
// orders/repository.ts
export interface OrderRepository { create(order: Order): Promise<void>; findByCode(code: string): Promise<Order | null> }
export function createFileOrderRepository(filePath?: string): OrderRepository      // default dataPath('orders.jsonl')
// orders/service.ts
export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; fields: Record<string, string> }
export function placeOrder(input: unknown, deps: { repo: OrderRepository; now: () => Date }): Promise<PlaceOrderResult>
export function toPublicOrder(order: Order): PublicOrder
```

Validation messages (exact): name `Vui lòng nhập họ tên (2–80 ký tự).`; phone `Số điện thoại không hợp lệ.` (regex `^(0|\+84)\d{9}$` after removing spaces and dots); email `Email không hợp lệ.`; province `Vui lòng chọn tỉnh/thành.`; address `Vui lòng nhập địa chỉ (5–200 ký tự).`; note `Ghi chú tối đa 500 ký tự.`; lines `Giỏ hàng không hợp lệ.` Strings are trimmed; an empty email becomes `undefined`; unknown keys are stripped (zod default), so a client-sent `total` or `unitPrice` is ignored. `placeOrder`: parse → every line must survive `sanitizeLines` unchanged (same count and quantities) else `fields.lines` → price with `computeTotals` → build `Order` → `repo.create`.

`POST /api/orders`, in order: `isSameOrigin` else 403 `FORBIDDEN`; rate limit (5 / 60 000 ms, module-level limiter) else 429 `RATE_LIMITED` with `Retry-After` and message `Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.`; `request.json()` failure or a body over 20 000 characters → 400 `VALIDATION` `Dữ liệu không hợp lệ.`; `placeOrder` failure → 400 with `fields`; success → 201 `ok({ code })`. Unexpected errors: `console.error` with context, 500 `INTERNAL` `Có lỗi xảy ra. Vui lòng thử lại.` and nothing else.

`CheckoutForm` (`'use client'`): labelled inputs `Họ và tên`, `Số điện thoại`, `Email (không bắt buộc)`, `Tỉnh/Thành phố` (select from a short constant list in the component file), `Địa chỉ`, `Ghi chú`; radios `Thanh toán khi nhận hàng (COD)` (default) and `Chuyển khoản ngân hàng`; order summary from `useCart().totals`; submit `ĐẶT HÀNG`, disabled and labelled `Đang xử lý…` while pending. Field errors render next to inputs with `aria-invalid` and `aria-describedby`; a non-field error renders in `role="alert"`. On success: `clear()` then `router.replace('/dat-hang-thanh-cong/' + code)`. Checkout page with an empty hydrated cart shows `Giỏ hàng của bạn đang trống.` and a link back, no form.

Success page (`dynamic = 'force-dynamic'`): code failing `ORDER_CODE_PATTERN` or not found → `notFound()`; shows `Đặt hàng thành công`, the code, lines, totals; for `bank` a sample transfer block (`Ngân hàng Mẫu`, account `0000 0000 0000`, content = the order code). It renders `toPublicOrder(order)` only. `metadata.robots = { index: false }`.

- [ ] **Step 1: Write the failing tests**

```ts
// rate-limit.test.ts
let t = 0; const hit = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t })
expect(hit('a').allowed).toBe(true); expect(hit('a').allowed).toBe(true)
expect(hit('a')).toEqual({ allowed: false, retryAfterSec: 1 }); expect(hit('b').allowed).toBe(true)
t = 1001; expect(hit('a').allowed).toBe(true)
expect(clientKey(new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } }))).toBe('1.2.3.4')
expect(clientKey(new Request('http://x'))).toBe('unknown')

// same-origin.test.ts
const rq = (h: Record<string, string>) => new Request('http://shop.test/api', { method: 'POST', headers: h })
expect(isSameOrigin(rq({ origin: 'http://shop.test', host: 'shop.test' }))).toBe(true)
expect(isSameOrigin(rq({ origin: 'https://evil.test', host: 'shop.test' }))).toBe(false)
expect(isSameOrigin(rq({ host: 'shop.test' }))).toBe(false)
expect(isSameOrigin(rq({ origin: 'not a url', host: 'shop.test' }))).toBe(false)

// jsonl-store.test.ts   (uses a mkdtemp directory)
expect(await readRecords(join(dir, 'missing.jsonl'))).toEqual([])
await appendRecord(join(dir, 'deep/a.jsonl'), { n: 1 }); await appendRecord(join(dir, 'deep/a.jsonl'), { n: 2 })
expect(await readRecords(join(dir, 'deep/a.jsonl'))).toEqual([{ n: 1 }, { n: 2 }])
await writeFile(join(dir, 'b.jsonl'), '{"n":1}\ngarbage\n\n{"n":3}\n'); expect(await readRecords(join(dir, 'b.jsonl'))).toEqual([{ n: 1 }, { n: 3 }])

// code.test.ts
const code = generateOrderCode(new Date('2026-11-18T03:00:00Z'), (n) => new Uint8Array(n))
expect(code).toBe('VS-261118-AAAAAAAA'); expect(ORDER_CODE_PATTERN.test(code)).toBe(true)
expect(ORDER_CODE_PATTERN.test('VS-261118-aaaa')).toBe(false); expect(ORDER_CODE_PATTERN.test('../../etc/passwd')).toBe(false)
expect(new Set(Array.from({ length: 200 }, () => generateOrderCode(new Date()))).size).toBe(200)

// schema.test.ts   (valid = { customer: { name: 'Nguyễn Văn A', phone: '0901 234 567', province: 'TP. Hồ Chí Minh', address: '12 Đường Mẫu' }, payment: 'cod', lines: [line(2)] })
expect(orderInputSchema.safeParse(valid).success).toBe(true)
expect(orderInputSchema.parse({ ...valid, customer: { ...valid.customer, phone: '+84901234567' } }).customer.phone).toBe('+84901234567')
expect(orderInputSchema.parse({ ...valid, customer: { ...valid.customer, email: '' } }).customer.email).toBeUndefined()
for (const phone of ['12345', '090123456', '09012345678', 'abcdefghij']) expect(orderInputSchema.safeParse({ ...valid, customer: { ...valid.customer, phone } }).success).toBe(false)
expect(orderInputSchema.safeParse({ ...valid, customer: { ...valid.customer, name: ' ' } }).success).toBe(false)
expect(orderInputSchema.safeParse({ ...valid, payment: 'crypto' }).success).toBe(false)
expect(orderInputSchema.safeParse({ ...valid, lines: [] }).success).toBe(false)
expect(orderInputSchema.safeParse({ ...valid, customer: { ...valid.customer, note: 'x'.repeat(501) } }).success).toBe(false)

// service.test.ts   (repo = in-memory fake; now = fixed date)
const r = await placeOrder({ ...valid, total: 1, lines: [{ ...line(2), unitPrice: 1 }] }, deps)
expect(r.ok && [r.order.subtotal, r.order.shipping, r.order.total]).toEqual([258000, 30000, 288000])   // client prices ignored
expect(r.ok && r.order.lines[0]).toMatchObject({ unitPrice: 129000, lineTotal: 258000, name: A.name })
for (const bad of [{ ...line(1), quantity: 0 }, { ...line(1), quantity: 1000 }, { ...line(1), productId: C.id }, { ...line(1), productId: 'GONE' }, { ...line(1), size: 'XXXL' }]) {
  const res = await placeOrder({ ...valid, lines: [bad] }, deps); expect(res.ok).toBe(false); expect(!res.ok && res.fields.lines).toBe('Giỏ hàng không hợp lệ.')
}
const e = await placeOrder({ ...valid, customer: { ...valid.customer, phone: '1' } }, deps)
expect(!e.ok && e.fields['customer.phone']).toBe('Số điện thoại không hợp lệ.')
expect(saved).toHaveLength(1)                                           // only the valid order was stored
expect('customer' in toPublicOrder(saved[0])).toBe(false)

// route.test.ts   (DATA_DIR = mkdtemp; post(body, headers) builds a same-origin Request with a unique x-forwarded-for per test)
const res = await POST(post(valid)); expect(res.status).toBe(201)
const json = await res.json(); expect(json).toMatchObject({ success: true, error: null }); expect(json.data.code).toMatch(ORDER_CODE_PATTERN)
expect((await POST(post(valid, { origin: 'https://evil.test' }))).status).toBe(403)
expect((await POST(rawPost('{oops'))).status).toBe(400)
const bad = await (await POST(post({ ...valid, lines: [] }))).json()
expect(bad).toMatchObject({ success: false, data: null, error: { code: 'VALIDATION' } })
const ip = { 'x-forwarded-for': '9.9.9.9' }; for (let i = 0; i < 5; i++) await POST(post(valid, ip))
const limited = await POST(post(valid, ip)); expect(limited.status).toBe(429); expect(limited.headers.get('retry-after')).toBeTruthy()
```

```tsx
// CheckoutForm.test.tsx   (cart seeded in localStorage; postJson mocked; next/navigation mocked)
await userEvent.click(await screen.findByRole('button', { name: 'ĐẶT HÀNG' }))        // empty form
expect(postJson).toHaveBeenCalledTimes(1)                                           // server is the validator
// mocked response: { success: false, data: null, error: { code: 'VALIDATION', message: 'x', fields: { 'customer.phone': 'Số điện thoại không hợp lệ.' } } }
expect(await screen.findByText('Số điện thoại không hợp lệ.')).toBeTruthy()
expect(screen.getByLabelText('Số điện thoại').getAttribute('aria-invalid')).toBe('true')
// pending: postJson returns a promise that stays open
await userEvent.click(screen.getByRole('button', { name: 'ĐẶT HÀNG' }))
expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toHaveProperty('disabled', true)
// rate limited
expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.')
// success
await waitFor(() => expect(replace).toHaveBeenCalledWith('/dat-hang-thanh-cong/VS-261118-AAAAAAAA')); expect(localStorage.getItem('vertex-cart-v1')).toBe('[]')
```

```ts
// e2e/checkout.spec.ts
test('ready product: cart to order success', async ({ page }) => {
  await page.goto('/danh-muc/ao-bong-da-khong-logo'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check(); await page.getByRole('button', { name: 'MUA NGAY' }).click()
  await expect(page).toHaveURL(/\/thanh-toan/)
  await page.getByLabel('Họ và tên').fill('Nguyễn Văn A'); await page.getByLabel('Số điện thoại').fill('0901234567')
  await page.getByLabel('Tỉnh/Thành phố').selectOption({ index: 1 }); await page.getByLabel('Địa chỉ').fill('12 Đường Mẫu')
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page).toHaveURL(/\/dat-hang-thanh-cong\/VS-\d{6}-[A-Z2-9]{8}/)
  await expect(page.getByRole('heading', { name: 'Đặt hàng thành công' })).toBeVisible()
  await expect(page.getByText('159.000 ₫')).toBeVisible()                 // 129.000 + 30.000
  await expect(page.getByText('0901234567')).toHaveCount(0)               // no PII on the success page
  await page.goto('/gio-hang'); await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
})
test('invalid phone shows the field error and keeps the cart', async ({ page }) => { /* same setup, phone '123' -> 'Số điện thoại không hợp lệ.' visible, URL still /thanh-toan */ })
test('unknown or malformed order code is a 404', async ({ page }) => {
  expect((await page.goto('/dat-hang-thanh-cong/VS-261118-ZZZZZZZZ'))?.status()).toBe(404)
  expect((await page.goto('/dat-hang-thanh-cong/abc'))?.status()).toBe(404)
})
test('checkout with an empty cart shows the empty state', async ({ page }) => {
  await page.goto('/thanh-toan'); await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'ĐẶT HÀNG' })).toHaveCount(0)
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/lib/http src/lib/storage src/lib/orders src/app/api/orders src/components/checkout` → FAIL.
- [ ] **Step 3: Implement** in this order: `http/*`, `storage/jsonl-store.ts`, `orders/*`, the route handler, `CheckoutForm`, the two pages.
- [ ] **Step 4: Run to verify pass** — vitest → PASS; `pnpm e2e e2e/checkout.spec.ts` → passed.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add order API, checkout and order success page"`

---

### Task 9: Quote requests and contact page

**Files:**
- Create: `src/lib/quotes/schema.ts`, `repository.ts`, `src/app/api/quotes/route.ts`, `src/components/quote/QuoteForm.tsx`, `src/app/bao-gia/page.tsx`, `src/app/lien-he/page.tsx`
- Test: `src/lib/quotes/schema.test.ts`, `src/app/api/quotes/route.test.ts`, `src/components/quote/QuoteForm.test.tsx`, `e2e/quote.spec.ts`

**Interfaces:**
- Consumes: `ok`, `fail`, `createRateLimiter`, `clientKey`, `isSameOrigin`, `postJson`, `appendRecord`, `dataPath`, `getTopCategories`, `getCategory`, `getProduct`, `MIN_QUOTE_QTY`, `MAX_QUOTE_QTY`, `SITE`.
- Produces:

```ts
export interface QuoteInput { name: string; phone: string; sport: string; quantity: number; message?: string; productSlug?: string }
export const quoteInputSchema: z.ZodType<QuoteInput>
export interface QuoteRepository { create(quote: QuoteInput & { createdAt: string }): Promise<void> }
export function createFileQuoteRepository(filePath?: string): QuoteRepository     // default dataPath('quotes.jsonl')
export function QuoteForm(props: { sports: readonly { slug: string; name: string }[]; product?: { slug: string; name: string }; compact?: boolean }): JSX.Element
```

Schema: name and phone rules and messages as in Task 8; `sport` must be a top-level category slug, message `Vui lòng chọn môn thể thao.`; `quantity` coerced from string, integer `5..10000`, message `Số lượng tối thiểu là 5 bộ.` below 5 and `Số lượng không hợp lệ.` otherwise; `message` ≤ 1000 (`Nội dung tối đa 1000 ký tự.`); `productSlug`, when present, must exist in the catalogue, otherwise it is dropped rather than rejected. `POST /api/quotes` follows the same sequence and messages as `POST /api/orders` with its own limiter; success → 201 `ok({ received: true })`.

`QuoteForm` (`'use client'`): labels `Họ và tên`, `Số điện thoại`, `Môn thể thao`, `Số lượng (bộ)` (`type="number"`, `min=5`, default `10`), `Nội dung yêu cầu`; with `product` it shows `Sản phẩm quan tâm: {name}` and sends its slug; `compact` hides the message field. Submit `GỬI YÊU CẦU`, pending `Đang gửi…` disabled. Success replaces the form with `role="status"` text `Đã nhận yêu cầu. Chúng tôi sẽ liên hệ trong 24 giờ.` Errors behave as in `CheckoutForm`. `/bao-gia`: awaits `searchParams`, resolves `san-pham` through `getProduct` (unknown slug is ignored), preselects the sport from the product's top-level category; beside the form, the hotline and Zalo buttons. `/lien-he`: address, hotline, email, map link from `SITE`, plus `<QuoteForm compact />`.

- [ ] **Step 1: Write the failing tests**

```ts
// schema.test.ts   (valid = { name: 'Trần B', phone: '0901234567', sport: 'ao-bong-da', quantity: '12' })
expect(quoteInputSchema.parse(valid).quantity).toBe(12)
const msg = (v: object) => { const r = quoteInputSchema.safeParse({ ...valid, ...v }); return r.success ? null : r.error.issues[0].message }
expect(msg({ quantity: 4 })).toBe('Số lượng tối thiểu là 5 bộ.')
expect(msg({ quantity: 5 })).toBeNull(); expect(msg({ quantity: 10000 })).toBeNull()
for (const q of [10001, 7.5, 'abc', '', -1]) expect(msg({ quantity: q })).not.toBeNull()
expect(msg({ sport: 'giay' })).toBe('Vui lòng chọn môn thể thao.')            // child category is not a sport option
expect(msg({ sport: 'khong-co' })).toBe('Vui lòng chọn môn thể thao.')
expect(msg({ message: 'x'.repeat(1001) })).toBe('Nội dung tối đa 1000 ký tự.')
expect(quoteInputSchema.parse({ ...valid, productSlug: 'khong-ton-tai' }).productSlug).toBeUndefined()

// route.test.ts — same shape as the orders route test: 201 + envelope, 403 cross-origin, 400 bad JSON, 400 with fields, 429 on the 6th call;
// plus: after one 201, readRecords(dataPath('quotes.jsonl')) has 1 record with createdAt and without any key outside QuoteInput.
```

```tsx
// QuoteForm.test.tsx   (postJson mocked)
render(<QuoteForm sports={sports} product={{ slug: 'ao-x', name: 'Áo X' }} />)
expect(screen.getByText('Sản phẩm quan tâm: Áo X')).toBeTruthy()
expect((screen.getByLabelText('Số lượng (bộ)') as HTMLInputElement).value).toBe('10')
// fill and submit -> postJson called with ('/api/quotes', expect.objectContaining({ productSlug: 'ao-x', quantity: '10' }))
expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Đã nhận yêu cầu. Chúng tôi sẽ liên hệ trong 24 giờ.')
expect(screen.queryByRole('button', { name: 'GỬI YÊU CẦU' })).toBeNull()
// double click while pending -> postJson called once
// 429 response -> role="alert" 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' and the typed values are still in the inputs
// compact -> screen.queryByLabelText('Nội dung yêu cầu') is null
```

```ts
// e2e/quote.spec.ts
test('custom product to quote request', async ({ page }) => {
  await page.goto('/danh-muc/ao-pickleball'); await page.locator('main article a').first().click()
  await page.getByRole('link', { name: 'Nhận báo giá cho mẫu này' }).click()
  await expect(page).toHaveURL(/\/bao-gia\?san-pham=/); await expect(page.getByText(/Sản phẩm quan tâm:/)).toBeVisible()
  await expect(page.getByLabel('Môn thể thao')).toHaveValue('ao-pickleball')
  await page.getByLabel('Họ và tên').fill('Trần B'); await page.getByLabel('Số điện thoại').fill('0901234567')
  await page.getByLabel('Số lượng (bộ)').fill('3'); await page.getByRole('button', { name: 'GỬI YÊU CẦU' }).click()
  await expect(page.getByText('Số lượng tối thiểu là 5 bộ.')).toBeVisible()
  await page.getByLabel('Số lượng (bộ)').fill('12'); await page.getByRole('button', { name: 'GỬI YÊU CẦU' }).click()
  await expect(page.getByText('Đã nhận yêu cầu. Chúng tôi sẽ liên hệ trong 24 giờ.')).toBeVisible()
})
test('quote page ignores an unknown product slug', async ({ page }) => {
  expect((await page.goto('/bao-gia?san-pham=khong-ton-tai'))?.status()).toBe(200)
  await expect(page.getByText(/Sản phẩm quan tâm:/)).toHaveCount(0)
})
test('header CTA and contact page reach the form', async ({ page }) => {
  await page.goto('/lien-he'); await expect(page.getByRole('button', { name: 'GỬI YÊU CẦU' })).toBeVisible()
})
```

`type="number"` with `min=5` would block the `3` submission in the browser, so the form sets `noValidate` and lets the server message show.

- [ ] **Step 2: Run to verify failure** — `pnpm test src/lib/quotes src/app/api/quotes src/components/quote` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run to verify pass** — vitest → PASS; `pnpm e2e e2e/quote.spec.ts` → passed.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add quote request API, quote page and contact page"`

---

### Task 10: Content pages, final gates, README

**Files:**
- Create: `src/lib/content/posts.ts`, `policies.ts`, `src/app/tin-tuc/page.tsx`, `src/app/tin-tuc/[slug]/page.tsx`, `src/app/chinh-sach/page.tsx`, `storefront/README.md` (replace the generated one)
- Test: `src/lib/content/posts.test.ts`, `e2e/content.spec.ts`, `e2e/links.spec.ts`

**Interfaces:**
- Consumes: `Breadcrumb`, `SectionHead`, `MAIN_NAV`, `POLICY_LINKS`.
- Produces:

```ts
export interface Post { readonly slug: string; readonly title: string; readonly excerpt: string; readonly date: string; readonly tag: string; readonly image: string; readonly body: readonly string[] }
export function getPosts(): readonly Post[]          // 6 sample posts, newest first
export function getPost(slug: string): Post | null
export interface PolicySection { readonly id: 'bao-mat' | 'giao-nhan' | 'doi-tra' | 'thanh-toan'; readonly title: string; readonly paragraphs: readonly string[] }
export const POLICY_SECTIONS: readonly PolicySection[]
```

Post topics are generic team-uniform advice (choosing fabric, sizing a team order, print methods…). Dates display as `dd/mm/yyyy`. Post body paragraphs render as text nodes (no `dangerouslySetInnerHTML` anywhere in the app). Unknown post slug → `notFound()`. Policy page renders one `<section id>` per entry so the four footer anchors resolve.

- [ ] **Step 1: Write the failing tests**

```ts
// posts.test.ts
const posts = getPosts(); expect(posts).toHaveLength(6)
expect(new Set(posts.map((p) => p.slug)).size).toBe(6)
expect(posts.map((p) => p.date)).toEqual([...posts.map((p) => p.date)].sort().reverse())
expect(getPost('khong-ton-tai')).toBeNull()
expect(POLICY_SECTIONS.map((s) => s.id)).toEqual(['bao-mat', 'giao-nhan', 'doi-tra', 'thanh-toan'])
expect(JSON.stringify([posts, POLICY_SECTIONS, getCategories(), listProducts({ pageSize: 64 }).items])).not.toMatch(/enzo/i)

// e2e/content.spec.ts
// /tin-tuc lists 6 articles; clicking the first opens /tin-tuc/<slug> with the same title as h1; /tin-tuc/khong-ton-tai -> 404;
// each of the 4 footer policy links lands on /chinh-sach with the matching section in the viewport.

// e2e/links.spec.ts
test('every internal link on key pages resolves', async ({ page, request }) => {
  const seen = new Set<string>()
  for (const start of ['/', '/danh-muc/ao-bong-da', '/tin-tuc', '/lien-he', '/chinh-sach']) {
    await page.goto(start)
    for (const href of await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname))) seen.add(href)
  }
  for (const href of seen) expect((await request.get(href)).status(), href).toBe(200)
})
test('no page logs a console error', async ({ page }) => {
  const errors: string[] = []; page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); page.on('pageerror', (e) => errors.push(e.message))
  for (const url of ['/', '/danh-muc/ao-bong-da', '/gio-hang', '/thanh-toan', '/bao-gia', '/tin-tuc', '/chinh-sach']) await page.goto(url)
  expect(errors).toEqual([])
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm test src/lib/content` → FAIL.
- [ ] **Step 3: Implement content modules and the three pages.**
- [ ] **Step 4: Write `storefront/README.md`** in Vietnamese: run commands (`pnpm dev`, `pnpm test`, `pnpm e2e`, `pnpm build`), where to change the brand (`src/config/site.ts`), products (`src/lib/catalog/products.ts`), commerce rules (`src/config/commerce.ts`), where orders and quotes are stored (`DATA_DIR`, JSON Lines, needs a persistent disk; swap the repository for a database before serverless hosting), and the out-of-scope list from spec section 3.
- [ ] **Step 5: Run every gate**

```bash
pnpm lint && pnpm exec tsc --noEmit && pnpm test:coverage && pnpm build && pnpm e2e
```

Expected: lint and tsc clean; all unit tests pass with every coverage threshold ≥ 80%; build succeeds; all e2e specs pass on `desktop` and `mobile`. If coverage is short, add tests for the uncovered branches reported; do not lower thresholds or exclude files.

- [ ] **Step 6: Visual check against the reference.** Run `pnpm dev`, open `/` at 1280px and 390px next to https://enzosport.vn/. Confirm: navy top bar, sticky white header with red pill CTA, rounded navy gradient hero with the blue middle headline line, trust strip overlapping the hero bottom, white product blocks on the soft background, pill buttons, product card radius 14px. Fix spacing or token drift found.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: add blog and policy pages, link checks and project README"`
