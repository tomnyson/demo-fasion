import { expect, test } from '@playwright/test'

test('home renders in Vietnamese with the sample brand', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Lá Studio/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(font).toContain('Roboto')
})

test('header stays visible while scrolling', async ({ page }) => {
  await page.goto('/'); await page.mouse.wheel(0, 2000)
  await expect(page.getByRole('banner')).toBeInViewport()
})

test('mobile shows the contact bar', async ({ page, isMobile }) => {
  test.skip(!isMobile); await page.goto('/')
  await expect(page.getByRole('link', { name: 'Chat Zalo' })).toBeVisible()
})

test('removed pages answer 404', async ({ page }) => {
  expect((await page.goto('/bao-gia'))?.status()).toBe(404)
})

test('contact page shows the shop details without a form', async ({ page }) => {
  await page.goto('/lien-he')
  await expect(page.getByRole('heading', { level: 1, name: 'Liên hệ' })).toBeVisible()
  await expect(page.locator('main form')).toHaveCount(0)
})
