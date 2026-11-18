import { expect, test } from '@playwright/test'

test('news list shows six articles and opens a post', async ({ page }) => {
  await page.goto('/tin-tuc')
  await expect(page.locator('main article')).toHaveCount(6)
  const first = page.locator('main article').first()
  const title = (await first.getByRole('heading').first().textContent())?.trim() ?? ''
  await first.getByRole('link').first().click()
  await expect(page).toHaveURL(/\/tin-tuc\/[a-z0-9-]+$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
})

test('unknown post is a 404', async ({ page }) => {
  expect((await page.goto('/tin-tuc/khong-ton-tai'))?.status()).toBe(404)
})

const POLICIES = [
  { link: 'Chính sách bảo mật', id: 'bao-mat' },
  { link: 'Chính sách giao nhận', id: 'giao-nhan' },
  { link: 'Chính sách đổi trả', id: 'doi-tra' },
  { link: 'Chính sách thanh toán', id: 'thanh-toan' },
]

for (const { link, id } of POLICIES) {
  test(`footer link "${link}" lands on its policy section`, async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').getByRole('link', { name: link }).click()
    await expect(page).toHaveURL(new RegExp(`/chinh-sach#${id}$`))
    await expect(page.locator(`section#${id}`)).toBeInViewport()
  })
}
