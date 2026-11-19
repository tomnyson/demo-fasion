import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Address } from '@/lib/addresses/schema'
import { jsonRequest, signedInUser } from '../test-helpers'

type Handler = (request: Request) => Promise<Response>
type IdHandler = (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>
let dir: string
let list: Handler
let create: Handler
let patch: IdHandler
let remove: IdHandler

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'address-routes-'))
  process.env.DATA_DIR = dir
  ;({ GET: list, POST: create } = await import('./route'))
  ;({ PATCH: patch, DELETE: remove } = await import('./[id]/route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

const input = (n: number) => ({ recipient: `Người nhận ${n}`, phone: '0901234567', province: 'Đà Nẵng', address: `${n} Bạch Đằng, Hải Châu` })
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const getList = (cookie?: string) =>
  list(new Request('http://shop.test/api/account/addresses', { headers: cookie === undefined ? {} : { cookie } }))
const addresses = async (res: Response): Promise<readonly Address[]> => (await res.json()).data.addresses

async function addFor(cookie: string, n: number): Promise<Address> {
  const res = await create(jsonRequest('POST', '/api/account/addresses', input(n), { cookie }))
  return (await res.json()).data.address
}

describe('address routes', () => {
  it('require a session', async () => {
    expect((await getList()).status).toBe(401)
    expect((await create(jsonRequest('POST', '/api/account/addresses', input(1)))).status).toBe(401)
    expect((await patch(jsonRequest('PATCH', '/api/account/addresses/x', input(1)), ctx('x'))).status).toBe(401)
    expect((await remove(jsonRequest('DELETE', '/api/account/addresses/x'), ctx('x'))).status).toBe(401)
  })

  it('creates and lists addresses, default first, without caching', async () => {
    const { cookie, userId } = await signedInUser()
    const res = await create(jsonRequest('POST', '/api/account/addresses', { ...input(1), userId: 'someone-else', isDefault: false }, { cookie }))
    expect(res.status).toBe(201)
    const body = (await res.json()).data
    expect(body.address).toMatchObject({ userId, isDefault: true, province: 'Đà Nẵng' })
    expect(body.addresses).toHaveLength(1)
    await addFor(cookie, 2)
    const listed = await getList(cookie)
    expect(listed.headers.get('cache-control')).toBe('no-store')
    expect((await addresses(listed)).map((a) => a.recipient)).toEqual(['Người nhận 1', 'Người nhận 2'])
  })

  it('validates input and enforces the 10-address cap', async () => {
    const { cookie } = await signedInUser()
    const bad = await create(jsonRequest('POST', '/api/account/addresses', { ...input(1), province: 'Paris' }, { cookie }))
    expect(bad.status).toBe(400)
    expect((await bad.json()).error.fields).toEqual({ province: 'Vui lòng chọn tỉnh/thành.' })
    for (let i = 0; i < 10; i++) await addFor(cookie, i)
    const over = await create(jsonRequest('POST', '/api/account/addresses', input(11), { cookie }))
    expect(over.status).toBe(409)
    expect((await over.json()).error).toMatchObject({ message: 'Tối đa 10 địa chỉ.', fields: { form: 'Tối đa 10 địa chỉ.' } })
  })

  it('updates, sets default and deletes the owner’s addresses', async () => {
    const { cookie } = await signedInUser()
    const first = await addFor(cookie, 1)
    const second = await addFor(cookie, 2)
    const edited = await patch(jsonRequest('PATCH', `/api/account/addresses/${second.id}`, input(7), { cookie }), ctx(second.id))
    expect(edited.status).toBe(200)
    expect((await edited.json()).data.address).toMatchObject({ id: second.id, recipient: 'Người nhận 7', isDefault: false })
    const promoted = await patch(jsonRequest('PATCH', `/api/account/addresses/${second.id}`, { isDefault: true }, { cookie }), ctx(second.id))
    expect((await addresses(promoted)).map((a) => [a.id, a.isDefault])).toEqual([[second.id, true], [first.id, false]])
    const invalid = await patch(jsonRequest('PATCH', `/api/account/addresses/${second.id}`, { recipient: 'A' }, { cookie }), ctx(second.id))
    expect(invalid.status).toBe(400)
    const deleted = await remove(jsonRequest('DELETE', `/api/account/addresses/${second.id}`, undefined, { cookie }), ctx(second.id))
    expect(deleted.status).toBe(200)
    expect((await addresses(deleted)).map((a) => [a.id, a.isDefault])).toEqual([[first.id, true]])
  })

  it('answers 404, never 403, for another user’s or an unknown address', async () => {
    const owner = await signedInUser()
    const intruder = await signedInUser()
    const address = await addFor(owner.cookie, 1)
    const attempts = [
      await patch(jsonRequest('PATCH', `/api/account/addresses/${address.id}`, input(9), { cookie: intruder.cookie }), ctx(address.id)),
      await patch(jsonRequest('PATCH', `/api/account/addresses/${address.id}`, { isDefault: true }, { cookie: intruder.cookie }), ctx(address.id)),
      await remove(jsonRequest('DELETE', `/api/account/addresses/${address.id}`, undefined, { cookie: intruder.cookie }), ctx(address.id)),
      await remove(jsonRequest('DELETE', '/api/account/addresses/nope', undefined, { cookie: owner.cookie }), ctx('nope')),
    ]
    for (const res of attempts) {
      expect(res.status).toBe(404)
      expect((await res.json()).error).toEqual({ code: 'NOT_FOUND', message: 'Không tìm thấy địa chỉ.' })
    }
    expect((await addresses(await getList(owner.cookie)))[0]).toMatchObject({ recipient: 'Người nhận 1', isDefault: true })
    expect(await addresses(await getList(intruder.cookie))).toEqual([])
  })

  it('refuses cross-origin writes', async () => {
    const { cookie } = await signedInUser()
    const res = await create(jsonRequest('POST', '/api/account/addresses', input(1), { cookie, origin: 'https://evil.com' }))
    expect(res.status).toBe(403)
  })
})
