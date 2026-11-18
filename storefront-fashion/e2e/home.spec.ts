import { expect, test, type Page } from '@playwright/test'

const SLIDER = { name: 'Bộ sưu tập nổi bật' }

test('home shows the slider and three collections', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('region', SLIDER)).toBeVisible()
  for (const name of ['Sản phẩm nổi bật', 'Best seller', 'Hàng mới về']) await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.locator('#san-pham article')).toHaveCount(24)
  await page.getByRole('link', { name: 'XEM THÊM' }).first().click()
  await expect(page).toHaveURL(/\/bo-suu-tap\/noi-bat/)
})

test('home has no horizontal scroll', async ({ page }) => {
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('slider works from the keyboard', async ({ page }) => {
  await page.goto('/')
  const before = await page.getByRole('region', SLIDER).getByRole('heading').textContent()
  await page.getByRole('button', { name: 'Slide sau' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('region', SLIDER).getByRole('heading')).not.toHaveText(before!)
})

test('slider stays still with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const heading = page.getByRole('region', SLIDER).getByRole('heading')
  const first = await heading.textContent()
  await page.waitForTimeout(6500)
  await expect(heading).toHaveText(first!)
})

const intersects = (a: DOMRect, b: DOMRect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y

for (const width of [850, 1024, 1280, 1440])
  test(`slider text and controls stay clear of the rail at ${width}px`, async ({ page, isMobile }) => {
    test.skip(isMobile)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const slider = page.getByRole('region', SLIDER)
    const rail = (await page.getByRole('navigation', { name: 'Liên hệ nhanh' }).boundingBox())!
    const targets = [
      slider.getByRole('heading'),
      slider.getByRole('link', { name: 'MUA NGAY' }),
      slider.getByRole('button', { name: 'Slide sau' }),
      slider.getByRole('button', { name: /^Chuyển tới slide/ }),
    ]
    for (const target of targets)
      for (const box of await target.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON())))
        expect(intersects(box, rail as DOMRect), `slider element at ${width}px`).toBe(false)
  })

for (const width of [850, 1024, 1280, 1440])
  test(`slider arrows never touch the text panel at ${width}px`, async ({ page, isMobile }) => {
    test.skip(isMobile)
    await page.setViewportSize({ width, height: 900 })
    await expectArrowsClearOfPanel(page)
  })

test('slider arrows never touch the text panel on the phone', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await expectArrowsClearOfPanel(page)
})

async function expectArrowsClearOfPanel(page: Page) {
  await page.goto('/')
  const slider = page.getByRole('region', SLIDER)
  const slides = await slider.getByRole('heading').count()
  for (let i = 0; i < slides; i += 1) {
    const panel = (await slider.getByRole('heading').nth(i).locator('xpath=..').boundingBox()) ?? null
    if (panel === null) {
      await slider.getByRole('button', { name: 'Slide sau' }).click()
      continue
    }
    for (const name of ['Slide trước', 'Slide sau']) {
      const arrow = (await slider.getByRole('button', { name }).boundingBox())!
      expect(intersects(arrow as DOMRect, panel as DOMRect), `${name} vs panel of slide ${i + 1}`).toBe(false)
    }
    await slider.getByRole('button', { name: 'Slide sau' }).click()
  }
}
