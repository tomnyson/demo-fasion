import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storedOrder } from '@/lib/orders/fixtures'
import { createFileOrderRepository } from '@/lib/orders/repository'

const viewer = { id: 'u1' }
vi.mock('@/lib/account/guard', () => ({ requireAccountUser: vi.fn(async () => viewer) }))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
  useRouter: () => ({ refresh: vi.fn() }),
}))

let dir: string
let OrdersPage: typeof import('./page').default
let OrderDetailPage: typeof import('./[code]/page').default
const MINE = 'LS-261118-MINE2222'
const THEIRS = 'LS-261118-THEIRS22'

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'orders-pages-'))
  process.env.DATA_DIR = dir
  const repo = createFileOrderRepository()
  await repo.create(storedOrder(MINE, { userId: 'u1', discount: 45800, couponCode: 'LASTUDIO10', customer: { name: 'Lan Anh', phone: '0901234567', province: 'Hà Nội', address: '12 Đường Mẫu', note: 'Gọi trước' } }))
  await repo.create(storedOrder(THEIRS, { userId: 'u2' }))
  ;({ default: OrdersPage } = await import('./page'))
  ;({ default: OrderDetailPage } = await import('./[code]/page'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})
beforeEach(() => {
  viewer.id = 'u1'
})

const detail = (code: string) => OrderDetailPage({ params: Promise.resolve({ code }) })

describe('account order pages', () => {
  it('lists only the signed-in customer’s orders', async () => {
    render(await OrdersPage())
    expect(screen.getByRole('link', { name: new RegExp(MINE) })).toBeTruthy()
    expect(screen.queryByText(THEIRS)).toBeNull()
  })

  it('shows the empty state to a customer without orders', async () => {
    viewer.id = 'u3'
    render(await OrdersPage())
    expect(screen.getByText('Bạn chưa có đơn hàng nào.')).toBeTruthy()
  })

  it('shows the detail with discount, recipient, timeline and the cancel action while pending', async () => {
    render(await detail(MINE))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(`Đơn ${MINE}`)
    expect(screen.getByText('Giảm giá (LASTUDIO10)')).toBeTruthy()
    expect(screen.getByText('Lan Anh')).toBeTruthy()
    expect(screen.getByText('Ghi chú: Gọi trước')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Tiến trình đơn hàng' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Huỷ đơn' })).toBeTruthy()
  })

  it('hides the cancel action once the order is confirmed', async () => {
    await createFileOrderRepository().updateStatus(MINE, 'confirmed', new Date())
    render(await detail(MINE))
    expect(screen.queryByRole('button', { name: 'Huỷ đơn' })).toBeNull()
  })

  it('answers not found for another customer’s order or a bad code', async () => {
    await expect(detail(THEIRS)).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(detail('nope')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
