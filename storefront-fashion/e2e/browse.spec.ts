import { expect, test } from '@playwright/test'

test.describe('browse', () => {
  test('listing shows one page and sorts', async ({ page }) => {
    await page.goto('/danh-muc/ao')
    await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
    await expect(page.locator('main article')).toHaveCount(12)
    await page.getByRole('combobox', { name: 'Sắp xếp' }).selectOption('price-asc')
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(page).not.toHaveURL(/page=/)
  })

  test('garbage listing params fall back instead of failing', async ({ page }) => {
    const res = await page.goto('/danh-muc/ao?page=abc&sort=xyz')
    expect(res?.status()).toBe(200)
    await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
    await page.goto('/danh-muc/ao?page=999')
    await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
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
      await page.getByPlaceholder('Tìm sản phẩm').fill('dam')
    } else {
      await page.getByPlaceholder('Tìm kiếm sản phẩm').fill('dam')
    }
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/tim-kiem\?q=dam/)
    await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
    await page.goto('/tim-kiem?q=')
    await expect(page.getByText('Nhập từ khoá để tìm sản phẩm.')).toBeVisible()
    await expect(page.locator('main article')).toHaveCount(0)
    await page.goto('/tim-kiem?q=' + encodeURIComponent('<img src=x onerror=alert(1)>'))
    await expect(page.getByText(/Không tìm thấy sản phẩm cho/)).toBeVisible()
    expect(await page.locator('main img[src="x"]').count()).toBe(0)
  })
})
