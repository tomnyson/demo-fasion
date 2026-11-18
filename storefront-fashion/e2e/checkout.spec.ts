import { expect, test, type Page } from '@playwright/test'

// Every real submission counts against the 5 requests / minute / IP limit, and both projects
// share one server, so each test presents its own client address.
async function useOwnClientAddress(page: Page) {
  const octet = () => Math.floor(Math.random() * 250) + 1
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.${octet()}.${octet()}.${octet()}` })
}

async function addReadyProductAndCheckout(page: Page) {
  await page.goto('/danh-muc/ao'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check(); await page.getByRole('button', { name: 'MUA NGAY' }).click()
  await expect(page).toHaveURL(/\/thanh-toan/)
}

async function fillRecipient(page: Page, phone: string) {
  await page.getByLabel('Họ và tên').fill('Nguyễn Văn A'); await page.getByLabel('Số điện thoại').fill(phone)
  await page.getByLabel('Tỉnh/Thành phố').selectOption({ index: 1 }); await page.getByLabel('Địa chỉ').fill('12 Đường Mẫu')
}

test.beforeEach(async ({ page }) => useOwnClientAddress(page))

test('ready product: cart to order success', async ({ page }) => {
  await addReadyProductAndCheckout(page)
  await fillRecipient(page, '0901234567')
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page).toHaveURL(/\/dat-hang-thanh-cong\/LS-\d{6}-[A-Z2-9]{8}/)
  await expect(page.getByRole('heading', { name: 'Đặt hàng thành công' })).toBeVisible()
  await expect(page.getByText('259.000 ₫')).toBeVisible()                 // 229.000 + 30.000
  await expect(page.getByText('0901234567')).toHaveCount(0)               // no PII on the success page
  await page.goto('/gio-hang'); await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
})

test('bank transfer order shows the transfer details and the order code', async ({ page }) => {
  await addReadyProductAndCheckout(page)
  await fillRecipient(page, '0901234567')
  await page.getByRole('radio', { name: 'Chuyển khoản ngân hàng' }).check()
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page).toHaveURL(/\/dat-hang-thanh-cong\/LS-\d{6}-[A-Z2-9]{8}/)
  const code = page.url().split('/').pop() ?? ''
  const transfer = page.getByRole('region', { name: 'Thông tin chuyển khoản' })
  await expect(transfer.getByText('Ngân hàng Mẫu')).toBeVisible()
  await expect(transfer.getByText(code)).toBeVisible()
})

test('invalid phone shows the field error and keeps the cart', async ({ page }) => {
  await addReadyProductAndCheckout(page)
  await fillRecipient(page, '123')
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page.getByText('Số điện thoại không hợp lệ.')).toBeVisible()
  await expect(page).toHaveURL(/\/thanh-toan/)
  await page.goto('/gio-hang'); await expect(page.getByTestId('cart-total')).toHaveText('259.000 ₫')
})

test('unknown or malformed order code is a 404', async ({ page }) => {
  expect((await page.goto('/dat-hang-thanh-cong/LS-261118-ZZZZZZZZ'))?.status()).toBe(404)
  expect((await page.goto('/dat-hang-thanh-cong/abc'))?.status()).toBe(404)
})

test('checkout with an empty cart shows the empty state', async ({ page }) => {
  await page.goto('/thanh-toan'); await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'ĐẶT HÀNG' })).toHaveCount(0)
})
