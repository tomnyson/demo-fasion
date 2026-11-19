import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAddressRepository, type AddressRepository } from '@/lib/addresses/repository'
import type { Address } from '@/lib/addresses/schema'
import { valid } from './fixtures'
import { createFileOrderRepository, type OrderRepository } from './repository'
import { placeOrder, type PlaceOrderDeps } from './service'

const HOME = { recipient: 'Trần Thị B', phone: '0912345678', province: 'Đà Nẵng', address: '45 Bạch Đằng' } as const
const ADDRESS_ERROR = { addressId: 'Địa chỉ giao hàng không hợp lệ.' }

let dir: string
let repo: OrderRepository
let addresses: AddressRepository
let home: Address
let deps: PlaceOrderDeps

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'order-address-'))
  repo = createFileOrderRepository(join(dir, 'orders.jsonl'))
  addresses = createAddressRepository(join(dir, 'addresses.jsonl'))
  const added = await addresses.add('u1', HOME)
  if (!added.ok) throw new Error('setup')
  home = added.address
  deps = { repo, addresses, userId: 'u1', now: () => new Date('2026-11-18T03:00:00Z') }
})
afterEach(() => rm(dir, { recursive: true, force: true }))

const { customer: _ignored, ...withoutCustomer } = valid
void _ignored
const orderCount = async () => (await repo.mutate((all) => ({ writes: [], result: all }))).length

describe('placeOrder with a saved address', () => {
  it('copies the recipient from the customer’s own book, keeping email and note from the form', async () => {
    const r = await placeOrder({ ...withoutCustomer, addressId: home.id, customer: { email: 'b@la.vn', note: 'Giao giờ hành chính' } }, deps)
    expect(r.ok && r.order.customer).toEqual({
      name: HOME.recipient,
      phone: HOME.phone,
      email: 'b@la.vn',
      province: HOME.province,
      address: HOME.address,
      note: 'Giao giờ hành chính',
    })
    expect(r.ok && r.order.userId).toBe('u1')
  })

  it('works without any customer fields', async () => {
    const r = await placeOrder({ ...withoutCustomer, addressId: home.id }, deps)
    expect(r.ok && r.order.customer).toEqual({ name: HOME.recipient, phone: HOME.phone, province: HOME.province, address: HOME.address })
  })

  it('refuses another user’s, an unknown or a malformed address id, and guests, storing nothing', async () => {
    const cases: [unknown, PlaceOrderDeps][] = [
      [{ ...withoutCustomer, addressId: home.id }, { ...deps, userId: 'u2' }],
      [{ ...withoutCustomer, addressId: 'nope' }, deps],
      [{ ...withoutCustomer, addressId: 42 }, deps],
      [{ ...valid, addressId: home.id }, { repo, now: deps.now }],
      [{ ...valid, addressId: home.id }, { repo, now: deps.now, userId: 'u1' }],
    ]
    for (const [input, d] of cases) expect(await placeOrder(input, d)).toEqual({ ok: false, fields: ADDRESS_ERROR })
    expect(await orderCount()).toBe(0)
  })

  it('treats an empty address id as a typed address', async () => {
    expect((await placeOrder({ ...valid, addressId: '' }, deps)).ok).toBe(true)
  })
})

describe('placeOrder with saveAddress', () => {
  const typed = { ...valid, customer: { ...valid.customer, province: 'Hà Nội' }, saveAddress: true }

  it('adds the typed recipient to the book once', async () => {
    expect((await placeOrder(typed, deps)).ok).toBe(true)
    expect((await placeOrder(typed, deps)).ok).toBe(true)
    const book = await addresses.listFor('u1')
    expect(book).toHaveLength(2)
    expect(book[1]).toMatchObject({ recipient: valid.customer.name, phone: '0901234567', province: 'Hà Nội', isDefault: false })
  })

  it('does not save without the flag, for guests, or for a saved address', async () => {
    await placeOrder({ ...typed, saveAddress: false }, deps)
    await placeOrder(typed, { repo, now: deps.now, addresses })
    await placeOrder({ ...withoutCustomer, addressId: home.id, saveAddress: true }, deps)
    expect(await addresses.listFor('u1')).toHaveLength(1)
    expect(await orderCount()).toBe(3)
  })

  it('still places the order when the address cannot be saved', async () => {
    const odd = await placeOrder({ ...typed, customer: { ...typed.customer, province: 'Sao Hoả' } }, deps)
    expect(odd.ok).toBe(true)
    for (let i = 0; i < 9; i += 1) await addresses.add('u1', { ...HOME, address: `${i} Đường Đầy` })
    expect((await placeOrder(typed, deps)).ok).toBe(true)
    expect(await addresses.listFor('u1')).toHaveLength(10)
  })

  it('logs and swallows a failing address book', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken: AddressRepository = { ...addresses, listFor: async () => Promise.reject(new Error('disk')) }
    expect((await placeOrder(typed, { ...deps, addresses: broken })).ok).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
