import { expect, test } from '@playwright/test'

test.describe('browse', () => {
  test('listing paginates and sorts', async ({ page }) => {
    await page.goto('/danh-muc/ao-bong-da')
    await expect(page.getByText('Hiển thị 1–16 của 28 kết quả')).toBeVisible()
    await expect(page.locator('main article')).toHaveCount(16)
    await page.getByRole('link', { name: '2', exact: true }).click()
    await expect(page.getByText('Hiển thị 17–28 của 28 kết quả')).toBeVisible()
    await page.getByRole('combobox', { name: 'Sắp xếp' }).selectOption('price-asc')
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(page).not.toHaveURL(/page=/)
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

  test('search works without diacritics and handles empty and hostile input', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      await page.getByRole('button', { name: 'Mở menu' }).click()
      await page.getByPlaceholder('Tìm sản phẩm').fill('ao bong da')
    } else {
      await page.getByPlaceholder('Tìm kiếm sản phẩm').fill('ao bong da')
    }
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/tim-kiem\?q=ao\+bong\+da/)
    await expect(page.getByText('Hiển thị 1–16 của 28 kết quả')).toBeVisible()
    await page.goto('/tim-kiem?q=')
    await expect(page.getByText('Nhập từ khoá để tìm sản phẩm.')).toBeVisible()
    await expect(page.locator('main article')).toHaveCount(0)
    await page.goto('/tim-kiem?q=' + encodeURIComponent('<img src=x onerror=alert(1)>'))
    await expect(page.getByText(/Không tìm thấy sản phẩm cho/)).toBeVisible()
    expect(await page.locator('main img[src="x"]').count()).toBe(0)
  })
})
