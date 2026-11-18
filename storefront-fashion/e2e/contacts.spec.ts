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

const intersects = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y

for (const width of [850, 1024, 1280, 1440])
  test(`desktop content stays clear of the rail at ${width}px`, async ({ page, isMobile }) => {
    test.skip(isMobile)
    await page.setViewportSize({ width, height: 800 })
    const rail = page.getByRole('navigation', { name: 'Liên hệ nhanh' })
    const clearOfRail = async (locators: readonly import('@playwright/test').Locator[], label: string) => {
      const railBox = (await rail.boundingBox())!
      for (const locator of locators)
        for (const box of await locator.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON())))
          expect(intersects(box, railBox), `${label} at ${width}px`).toBe(false)
    }
    const noScroll = async (label: string) =>
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), label).toBe(true)
    const scrollEach = async (selector: string) => {
      for (const el of await page.locator(selector).all()) {
        await el.scrollIntoViewIfNeeded()
        await clearOfRail([el], selector)
      }
    }
    const shellClear = async (label: string) => {
      const railBox = (await rail.boundingBox())!
      const rights = await page.locator('.container-site').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().right))
      for (const right of rights) expect(right, `${label} content column at ${width}px`).toBeLessThanOrEqual(railBox.x)
    }

    for (const url of ['/', '/san-pham']) {
      await page.goto(url)
      await scrollEach('main article')
      await shellClear(url)
      await noScroll(url)
    }

    await page.goto('/danh-muc/ao')
    await page.locator('main article a').first().click()
    await page.getByRole('radio', { name: 'M', exact: true }).check()
    await scrollEach('main button:has-text("THÊM VÀO GIỎ"), main button:has-text("MUA NGAY")')
    await noScroll('product')
    await page.getByRole('button', { name: 'THÊM VÀO GIỎ' }).click()

    await page.goto('/gio-hang')
    await expect(page.getByTestId('cart-total')).toBeVisible()
    await scrollEach('[data-testid="cart-total"]')
    await clearOfRail([page.getByRole('banner').getByRole('link', { name: /giỏ hàng/i })], 'cart link')
    await noScroll('/gio-hang')

    await page.goto('/thanh-toan')
    await scrollEach('[data-testid="cart-total"]')
    await scrollEach('button:has-text("ĐẶT HÀNG")')
    await noScroll('/thanh-toan')
  })
