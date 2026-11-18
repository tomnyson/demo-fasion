import { expect, test } from '@playwright/test'

const START_PAGES = ['/', '/danh-muc/ao', '/san-pham', '/bo-suu-tap/sale', '/tin-tuc', '/thoi-trang', '/gioi-thieu', '/lien-he', '/chinh-sach']

test('every internal link on key pages resolves', async ({ page, request }) => {
  const seen = new Set<string>()
  for (const start of START_PAGES) {
    await page.goto(start)
    const paths = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).pathname),
    )
    for (const path of paths) if (!path.startsWith('/api/')) seen.add(path)
  }
  for (const href of seen) expect((await request.get(href)).status(), href).toBe(200)
})

test('no page logs a console error', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  for (const url of [...START_PAGES.slice(0, 2), '/gio-hang', '/thanh-toan', ...START_PAGES.slice(2)]) {
    await page.goto(url)
  }
  expect(errors).toEqual([])
})
