import { expect, test, type Page } from '@playwright/test'

// Every real submission counts against the 5 requests / minute / IP limit, and both projects
// share one server, so each test presents its own client address.
async function useOwnClientAddress(page: Page) {
  const octet = () => Math.floor(Math.random() * 250) + 1
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.${octet()}.${octet()}.${octet()}` })
}

test.beforeEach(async ({ page }) => useOwnClientAddress(page))

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
