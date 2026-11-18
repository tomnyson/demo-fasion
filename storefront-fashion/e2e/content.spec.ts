import { expect, test } from '@playwright/test'

test('news and fashion lists each show three articles and share none', async ({ page }) => {
  const hrefs: Record<string, string[]> = {}
  for (const path of ['/tin-tuc', '/thoi-trang']) {
    await page.goto(path)
    await expect(page.locator('main article')).toHaveCount(3)
    hrefs[path] = await page.locator('main article a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname))
  }
  expect(hrefs['/tin-tuc'].filter((h) => hrefs['/thoi-trang'].includes(h))).toEqual([])
})

test('a fashion article opens at /tin-tuc/<slug> with a breadcrumb back to Thời trang', async ({ page }) => {
  await page.goto('/thoi-trang')
  const first = page.locator('main article').first()
  const title = (await first.getByRole('heading').first().textContent())?.trim() ?? ''
  await first.getByRole('link').first().click()
  await expect(page).toHaveURL(/\/tin-tuc\/[a-z0-9-]+$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Thời trang' })).toHaveAttribute('href', '/thoi-trang')
})

test('unknown post is a 404', async ({ page }) => {
  expect((await page.goto('/tin-tuc/khong-ton-tai'))?.status()).toBe(404)
})

const FOOTER_POLICIES = [
  { link: 'Hướng dẫn mua hàng', id: 'huong-dan-mua-hang' },
  { link: 'Chính sách vận chuyển', id: 'van-chuyen' },
  { link: 'Phương thức thanh toán', id: 'thanh-toan' },
  { link: 'Quy định đổi hàng', id: 'doi-hang' },
  { link: 'Chính sách bảo mật', id: 'bao-mat' },
]

for (const { link, id } of FOOTER_POLICIES) {
  test(`footer link "${link}" lands on its policy section`, async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').getByRole('link', { name: link }).click()
    await expect(page).toHaveURL(new RegExp(`/chinh-sach#${id}$`))
    await expect(page.locator(`section#${id}`)).toBeInViewport()
  })
}

test('footer about links reach the about, fashion and contact pages', async ({ page }) => {
  for (const [link, path] of [['Giới thiệu', '/gioi-thieu'], ['Tin thời trang', '/thoi-trang'], ['Liên hệ', '/lien-he']]) {
    await page.goto('/')
    await page.locator('footer').getByRole('link', { name: link, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
  }
})

test('top bar policy link opens the policy page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Điều khoản – Chính sách' }).click()
  await expect(page).toHaveURL(/\/chinh-sach$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Chính sách' })).toBeVisible()
})

test('contact page has five channel buttons and no form', async ({ page }) => {
  await page.goto('/lien-he')
  const main = page.locator('main')
  for (const name of ['Hotline', 'Zalo', 'Messenger', 'Shopee', 'Tiktok']) {
    await expect(main.getByRole('link', { name, exact: true })).toHaveCount(1)
  }
  await expect(main.locator('form')).toHaveCount(0)
})

test('about page has its heading', async ({ page }) => {
  await page.goto('/gioi-thieu')
  await expect(page.getByRole('heading', { level: 1, name: 'Giới thiệu Lá Studio' })).toBeVisible()
})
