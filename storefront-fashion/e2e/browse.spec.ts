import { expect, test } from '@playwright/test'

test.describe('browse', () => {
  test('category listing shows one page and sorts', async ({ page }) => {
    await page.goto('/danh-muc/ao')
    await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
    await expect(page.locator('main article')).toHaveCount(12)
    await page.getByRole('combobox', { name: 'Sắp xếp' }).selectOption('price-asc')
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(page).not.toHaveURL(/page=/)
  })

  test('all-products page paginates', async ({ page }) => {
    await page.goto('/san-pham')
    await expect(page.getByText('Hiển thị 1–16 của 48 kết quả')).toBeVisible()
    await page.getByRole('link', { name: '3', exact: true }).click()
    await expect(page.getByText('Hiển thị 33–48 của 48 kết quả')).toBeVisible()
  })

  test('collection pages list the right products', async ({ page }) => {
    await page.goto('/bo-suu-tap/sale')
    await expect(page.getByText('Hiển thị 1–16 của 16 kết quả')).toBeVisible()
    await expect(page.locator('main article').filter({ hasText: /-\d+%/ })).toHaveCount(16)
    await page.goto('/bo-suu-tap/hang-moi')
    await expect(page.getByText('Hiển thị 1–12 của 12 kết quả')).toBeVisible()
  })

  test('hand-typed URLs fail safely', async ({ page }) => {
    for (const url of ['/bo-suu-tap/khong-co', '/danh-muc/ao-bong-da', '/danh-muc/phu-kien'])
      expect((await page.goto(url))?.status(), url).toBe(404)
    expect((await page.goto('/san-pham?page=999&sort=xyz'))?.status()).toBe(200)
    await expect(page.getByText('Hiển thị 33–48 của 48 kết quả')).toBeVisible()
    expect((await page.goto('/bo-suu-tap/sale?page=abc'))?.status()).toBe(200)
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
