import { expect, test } from '@playwright/test'

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
