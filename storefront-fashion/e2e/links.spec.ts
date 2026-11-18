import { expect, test } from '@playwright/test'

test('every internal link on key pages resolves', async ({ page, request }) => {
  const seen = new Set<string>()
  for (const start of ['/', '/danh-muc/ao-bong-da', '/tin-tuc', '/lien-he', '/chinh-sach']) {
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
  for (const url of ['/', '/danh-muc/ao-bong-da', '/gio-hang', '/thanh-toan', '/tin-tuc', '/chinh-sach']) {
    await page.goto(url)
  }
  expect(errors).toEqual([])
})
