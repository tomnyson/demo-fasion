import { expect, test } from '@playwright/test'

test.describe('product detail', () => {
  test('every product can be added to the cart', async ({ page }) => {
    await page.goto('/danh-muc/ao-cau-long')
    await page.locator('main article a').first().click()
    await expect(page).toHaveURL(/\/san-pham\//)
    await expect(page.getByRole('button', { name: 'THÊM VÀO GIỎ' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'LIÊN HỆ ĐẶT HÀNG' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Mở bảng size' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Sản phẩm tương tự' })).toBeVisible()
  })

  test('unknown product is a 404 page', async ({ page }) => {
    expect((await page.goto('/san-pham/khong-ton-tai'))?.status()).toBe(404)
  })
})
