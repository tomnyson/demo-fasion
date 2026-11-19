import { randomUUID } from 'node:crypto'
import { expect, test, type Browser, type Page } from '@playwright/test'

// Login, register, orders and coupon previews are rate-limited per IP, so each test (and each extra
// browser context) presents its own address. Both projects share one server and one data dir.
const PASSWORD = 'MatKhau-12345'
const octet = () => Math.floor(Math.random() * 250) + 1
const ownAddress = () => ({ 'x-forwarded-for': `10.${octet()}.${octet()}.${octet()}` })
const newEmail = () => `e2e+${randomUUID()}@example.com`

test.beforeEach(async ({ page }) => {
  await page.context().setExtraHTTPHeaders(ownAddress())
})

async function register(page: Page, email: string, name = 'Khách E2E') {
  await page.goto('/dang-ky')
  await page.getByLabel('Họ và tên').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mật khẩu (8–72 ký tự)').fill(PASSWORD)
  await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click()
  await expect(page).toHaveURL(/\/tai-khoan$/)
  await expect(page.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeVisible()
}

async function login(page: Page, email: string, path = '/dang-nhap') {
  await page.goto(path)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mật khẩu').fill(PASSWORD)
  await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click()
}

async function logout(page: Page) {
  // Retry the click: under load it can land before the account nav has hydrated.
  await expect(async () => {
    await page.getByRole('navigation', { name: 'Tài khoản' }).getByRole('button', { name: 'Đăng xuất' }).click({ timeout: 2000 })
    await expect(page).toHaveURL(/\/$/, { timeout: 3000 })
  }).toPass({ timeout: 15_000 })
}

async function addShirt(page: Page, extra = 0) {
  await page.goto('/danh-muc/ao'); await page.locator('main article a').first().click()
  await page.getByRole('radio', { name: 'M', exact: true }).check(); await page.getByRole('button', { name: 'MUA NGAY' }).click()
  await expect(page).toHaveURL(/\/thanh-toan/)
  if (extra === 0) return
  await page.goto('/gio-hang')
  for (let i = 0; i < extra; i += 1) await page.getByRole('button', { name: 'Tăng số lượng' }).first().click()
  await page.goto('/thanh-toan')
}

async function saveAddress(page: Page, recipient: string, phone: string, address: string) {
  await page.getByRole('button', { name: '+ Thêm địa chỉ' }).click()
  const form = page.getByRole('form', { name: 'Thêm địa chỉ' })
  await form.getByLabel('Tên người nhận').fill(recipient)
  await form.getByLabel('Số điện thoại').fill(phone)
  await form.getByLabel('Tỉnh/Thành phố').selectOption({ index: 1 })
  await form.getByLabel('Địa chỉ', { exact: true }).fill(address)
  await form.getByRole('button', { name: 'LƯU ĐỊA CHỈ' }).click()
  await expect(page.getByRole('article', { name: recipient })).toBeVisible()
}

async function placeGuestOrderCode(page: Page): Promise<string> {
  await page.getByLabel('Họ và tên').fill('Người Mua'); await page.getByLabel('Số điện thoại').fill('0901234567')
  await page.getByLabel('Tỉnh/Thành phố').selectOption({ index: 1 }); await page.getByLabel('Địa chỉ', { exact: true }).fill('12 Đường Mẫu')
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page).toHaveURL(/\/dat-hang-thanh-cong\/LS-\d{6}-[A-Z2-9]{8}/)
  return page.url().split('/').pop() ?? ''
}

test('sign up, sign out, sign back in', async ({ page }) => {
  const email = newEmail()
  await register(page, email)
  await expect(page.getByText(email)).toBeVisible()
  await logout(page)

  await page.goto('/tai-khoan')                                   // guests are sent to sign in, then back
  await expect(page).toHaveURL(/\/dang-nhap\?next=%2Ftai-khoan/)
  await page.getByLabel('Email').fill(email); await page.getByLabel('Mật khẩu').fill('sai-mat-khau')
  await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click()
  await expect(page.locator('form').getByRole('alert')).toBeVisible()
  await page.getByLabel('Mật khẩu').fill(PASSWORD)
  await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click()
  await expect(page).toHaveURL(/\/tai-khoan$/)
  await expect(page.getByText(email)).toBeVisible()
})

test('a duplicate email is refused at sign up', async ({ page }) => {
  const email = newEmail()
  await register(page, email)
  await logout(page)
  await page.goto('/dang-ky')
  await page.getByLabel('Họ và tên').fill('Khách Hai'); await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mật khẩu (8–72 ký tự)').fill(PASSWORD)
  await page.getByRole('button', { name: 'TẠO TÀI KHOẢN' }).click()
  await expect(page).toHaveURL(/\/dang-ky/)
  await expect(page.locator('form [role="alert"], form [id$="-error"]').first()).toBeVisible()
})

test('address book: add two addresses and make the second the default', async ({ page }) => {
  await register(page, newEmail())
  await page.goto('/tai-khoan/dia-chi')
  await saveAddress(page, 'Người Một', '0901111111', '1 Đường Một')
  await saveAddress(page, 'Người Hai', '0902222222', '2 Đường Hai')
  await expect(page.getByRole('article', { name: 'Người Một' }).getByText('Mặc định', { exact: true })).toBeVisible()
  await page.getByRole('article', { name: 'Người Hai' }).getByRole('button', { name: 'Đặt làm mặc định' }).click()
  await expect(page.getByRole('article', { name: 'Người Hai' }).getByText('Mặc định', { exact: true })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Người Một' }).getByText('Mặc định', { exact: true })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('article', { name: 'Người Hai' }).getByText('Mặc định', { exact: true })).toBeVisible()
})

test('checkout with the second saved address and LASTUDIO10, then cancel the order', async ({ page }) => {
  await register(page, newEmail())
  await page.goto('/tai-khoan/dia-chi')
  await saveAddress(page, 'Người Một', '0901111111', '1 Đường Một')
  await saveAddress(page, 'Người Hai', '0902222222', '2 Đường Hai')

  await addShirt(page, 1)
  await expect(page.getByRole('radio', { name: /Người Một/ })).toBeChecked()      // default preselected
  await page.getByRole('radio', { name: /Người Hai/ }).check()
  await expect(page.getByLabel('Họ và tên')).toHaveCount(0)                      // typed fields hidden
  await page.getByLabel('Mã giảm giá').fill('lastudio10'); await page.keyboard.press('Enter')
  await expect(page.getByTestId('checkout-discount')).toHaveText('−45.800 ₫')
  await expect(page.getByTestId('checkout-total')).toHaveText('442.200 ₫')
  await page.getByRole('button', { name: 'ĐẶT HÀNG' }).click()
  await expect(page).toHaveURL(/\/dat-hang-thanh-cong\/LS-\d{6}-[A-Z2-9]{8}/)
  const code = page.url().split('/').pop() ?? ''

  await page.goto('/tai-khoan/don-hang')
  const row = page.getByRole('link', { name: new RegExp(code) })
  await expect(row).toContainText('Chờ xác nhận')
  await row.click()
  await expect(page).toHaveURL(new RegExp(`/tai-khoan/don-hang/${code}$`))
  await expect(page.getByRole('region', { name: 'Địa chỉ nhận hàng' })).toContainText('2 Đường Hai')

  await page.getByRole('button', { name: 'Huỷ đơn' }).click()
  await page.getByRole('group', { name: 'Xác nhận huỷ đơn' }).getByRole('button', { name: 'Huỷ đơn' }).click()
  await expect(page.getByRole('heading', { level: 1 }).locator('..').getByText('Đã huỷ')).toBeVisible()
  await page.goto('/tai-khoan/don-hang')
  await expect(page.getByRole('link', { name: new RegExp(code) })).toContainText('Đã huỷ')
})

test('the save-address checkbox sits under the address fields, before payment', async ({ page }) => {
  await register(page, newEmail())
  await addShirt(page)
  const save = (await page.getByLabel('Lưu vào sổ địa chỉ').boundingBox())!
  const address = (await page.getByLabel('Địa chỉ', { exact: true }).boundingBox())!
  const payment = (await page.getByRole('radio', { name: 'Chuyển khoản ngân hàng' }).boundingBox())!
  expect(save.y).toBeGreaterThan(address.y)
  expect(save.y).toBeLessThan(payment.y)
})

test('a guest using the members-only code is asked to sign in', async ({ page }) => {
  await addShirt(page)
  await page.getByLabel('Mã giảm giá').fill('THANHVIEN15'); await page.getByRole('button', { name: 'ÁP DỤNG' }).click()
  await expect(page.locator('#checkout-coupon-error')).toHaveText('Vui lòng đăng nhập để dùng mã này.')
})

test('a member can use THANHVIEN15 once', async ({ page }) => {
  await register(page, newEmail())
  await addShirt(page, 1)
  await page.getByLabel('Mã giảm giá').fill('THANHVIEN15'); await page.keyboard.press('Enter')
  await expect(page.getByTestId('checkout-discount')).toBeVisible()
  await placeGuestOrderCode(page)

  await addShirt(page, 1)
  await page.getByLabel('Mã giảm giá').fill('THANHVIEN15'); await page.keyboard.press('Enter')
  await expect(page.locator('#checkout-coupon-error')).toBeVisible()
  await expect(page.getByTestId('checkout-discount')).toHaveCount(0)
})

async function otherUserContext(browser: Browser, baseURL: string | undefined) {
  const context = await browser.newContext({ baseURL, extraHTTPHeaders: ownAddress() })
  return { context, page: await context.newPage() }
}

test("another member gets 404 on someone else's order", async ({ page, browser, baseURL }) => {
  await register(page, newEmail())
  await addShirt(page)
  const code = await placeGuestOrderCode(page)
  await page.goto(`/tai-khoan/don-hang/${code}`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(code)

  const other = await otherUserContext(browser, baseURL)
  try {
    await register(other.page, newEmail(), 'Khách B')
    const response = await other.page.goto(`/tai-khoan/don-hang/${code}`)
    expect(response?.status()).toBe(404)
    await expect(other.page.getByText(code)).toHaveCount(0)
  } finally {
    await other.context.close()
  }
})

test('an open-redirect next parameter lands on the account page', async ({ page }) => {
  const email = newEmail()
  await register(page, email)
  await logout(page)
  await login(page, email, '/dang-nhap?next=//evil.com')
  await expect(page).toHaveURL(/\/tai-khoan$/)
  expect(new URL(page.url()).hostname).not.toBe('evil.com')
})

test('a safe next path is honoured after sign in', async ({ page }) => {
  const email = newEmail()
  await register(page, email)
  await logout(page)
  await login(page, email, '/dang-nhap?next=%2Ftai-khoan%2Fdon-hang')
  await expect(page).toHaveURL(/\/tai-khoan\/don-hang$/)
})
