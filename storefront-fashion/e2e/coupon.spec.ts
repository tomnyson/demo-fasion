import { expect, test, type Page } from '@playwright/test'

// Coupon previews and orders are rate-limited per IP, so each test presents its own address.
test.beforeEach(async ({ page }) => {
  const octet = () => Math.floor(Math.random() * 250) + 1
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.${octet()}.${octet()}.${octet()}` })
})

async function checkoutWithOneShirt(page: Page) {
  await page.goto('/danh-muc/ao'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check(); await page.getByRole('button', { name: 'MUA NGAY' }).click()
  await expect(page).toHaveURL(/\/thanh-toan/)
}

test('FREESHIP removes the shipping fee and is kept on the placed order', async ({ page }) => {
  await checkoutWithOneShirt(page)
  await expect(page.getByTestId('checkout-total')).toHaveText('259.000 ₫')
  await page.getByRole('button', { name: 'FREESHIP' }).click()
  await expect(page.getByRole('status')).toContainText('FREESHIP')
  await expect(page.getByTestId('checkout-total')).toHaveText('229.000 ₫')

  await page.getByLabel('Họ và tên').fill('Nguyễn Văn A'); await page.getByLabel('Số điện thoại').fill('0901234567')
  await page.getByLabel('Tỉnh/Thành phố').selectOption({ index: 1 }); await page.getByLabel('Địa chỉ', { exact: true }).fill('12 Đường Mẫu')
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page).toHaveURL(/\/dat-hang-thanh-cong\//)
  await expect(page.getByText('229.000 ₫').last()).toBeVisible()
})

test('a percent code shows the discount line once the order is large enough', async ({ page }) => {
  await checkoutWithOneShirt(page)
  const code = page.getByLabel('Mã giảm giá')
  await code.fill('lastudio10'); await page.getByRole('button', { name: 'ÁP DỤNG' }).click()
  await expect(page.locator('#checkout-coupon-error')).toHaveText('Đơn hàng chưa đạt giá trị tối thiểu 300.000 ₫.')

  await page.goto('/gio-hang')
  await page.getByRole('button', { name: 'Tăng số lượng' }).first().click()
  await expect(page.getByTestId('cart-total')).toHaveText('488.000 ₫')
  await page.goto('/thanh-toan')
  await page.getByLabel('Mã giảm giá').fill('lastudio10'); await page.keyboard.press('Enter')
  await expect(page.getByTestId('checkout-discount')).toHaveText('−45.800 ₫')
  await expect(page.getByTestId('checkout-total')).toHaveText('442.200 ₫')
})

test('an unknown code is refused', async ({ page }) => {
  await checkoutWithOneShirt(page)
  await page.getByLabel('Mã giảm giá').fill('KHONGCO'); await page.getByRole('button', { name: 'ÁP DỤNG' }).click()
  await expect(page.locator('#checkout-coupon-error')).toHaveText('Mã giảm giá không tồn tại.')
})
