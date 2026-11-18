import { expect, test } from '@playwright/test'

test('add a ready product, edit and persist the cart', async ({ page }) => {
  await page.goto('/danh-muc/ao-bong-da-khong-logo'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check()
  await page.getByRole('button', { name: 'THÊM VÀO GIỎ' }).click()
  await expect(page.getByRole('link', { name: 'Giỏ hàng, 1 sản phẩm' })).toBeVisible()
  await page.getByRole('link', { name: /Giỏ hàng/ }).click()
  await expect(page.getByText('Mua thêm 8 sản phẩm để được miễn phí giao hàng.')).toBeVisible()
  await page.getByRole('button', { name: 'Tăng số lượng' }).click()
  await expect(page.getByTestId('cart-total')).toHaveText('288.000 ₫')
  await page.reload(); await expect(page.getByTestId('cart-total')).toHaveText('288.000 ₫')
  await page.getByRole('button', { name: 'Xoá' }).click()
  await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
})

test('a corrupt stored cart does not break the site', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('la-studio-cart-v1', '{{{'))
  await page.goto('/gio-hang'); await expect(page.getByText('Giỏ hàng của bạn đang trống.')).toBeVisible()
})
