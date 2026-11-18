import { expect, test } from '@playwright/test'

test('home lists 24 product cards in #san-pham', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#san-pham article')).toHaveCount(24)
})

test('home has no horizontal scroll', async ({ page }) => {
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
