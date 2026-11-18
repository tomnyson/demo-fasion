import { expect, test } from '@playwright/test'

const pages = ['/', '/san-pham', '/gio-hang', '/thanh-toan', '/lien-he']

test('the rail shows six contacts on every page', async ({ page }) => {
  for (const url of pages) {
    await page.goto(url)
    await expect(page.getByRole('navigation', { name: 'Liên hệ nhanh' }).getByRole('link')).toHaveCount(6)
  }
})

test('desktop rail is a right-edge column', async ({ page, isMobile }) => {
  test.skip(isMobile)
  await page.goto('/')
  const boxes = await page.getByRole('navigation', { name: 'Liên hệ nhanh' }).getByRole('link').evaluateAll((as) => as.map((a) => a.getBoundingClientRect()))
  expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(1)
  expect(boxes[0].x + boxes[0].width).toBeGreaterThan(1280 - 40)
  expect(Math.round(boxes[0].width)).toBe(84)
})

for (const width of [390, 320])
  test(`phone bar never covers the buy and order buttons at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.goto('/danh-muc/ao')
    await page.locator('main article a').first().click()
    await page.getByRole('radio', { name: 'M', exact: true }).check()
    const bar = page.getByRole('navigation', { name: 'Liên hệ nhanh' })
    const overlaps = async (name: string) => {
      const btn = page.getByRole('button', { name })
      await btn.scrollIntoViewIfNeeded()
      const [a, b] = [await btn.boundingBox(), await bar.boundingBox()]
      return a!.y + a!.height > b!.y && a!.y < b!.y + b!.height
    }
    expect(await overlaps('THÊM VÀO GIỎ')).toBe(false)
    await page.getByRole('button', { name: 'MUA NGAY' }).click()
    await page.waitForURL(/thanh-toan/)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    expect(await overlaps('ĐẶT HÀNG')).toBe(false)
    for (const url of ['/', '/san-pham', '/gio-hang', '/thanh-toan']) {
      await page.goto(url)
      if (url === '/gio-hang') await expect(page.getByRole('table')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), url).toBe(true)
    }
  })
