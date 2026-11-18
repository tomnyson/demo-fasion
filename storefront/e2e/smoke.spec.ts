import { expect, test } from '@playwright/test'

test('home renders in Vietnamese with the sample brand', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Vertex Sport/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(font).toContain('Roboto')
})
