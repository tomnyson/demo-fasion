import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { dataPath, readRecords } from '@/lib/storage/jsonl-store'

let dir: string
let POST: (request: Request) => Promise<Response>
let counter = 0

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'quotes-route-'))
  process.env.DATA_DIR = dir
  ;({ POST } = await import('./route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

const valid = { name: 'Trần B', phone: '0901234567', sport: 'ao-bong-da', quantity: '12' }

const send = (text: string, headers: Record<string, string> = {}) => {
  counter += 1
  return new Request('http://shop.test/api/quotes', {
    method: 'POST',
    headers: { origin: 'http://shop.test', host: 'shop.test', 'content-type': 'application/json', 'x-forwarded-for': `10.1.0.${counter}`, ...headers },
    body: text,
  })
}
const post = (body: unknown, headers?: Record<string, string>) => send(JSON.stringify(body), headers)

describe('POST /api/quotes', () => {
  it('stores the validated quote plus createdAt and nothing else', async () => {
    const res = await POST(post({ ...valid, message: 'Cần gấp', extra: 'ignored' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ success: true, data: { received: true }, error: null })
    const records = await readRecords<Record<string, unknown>>(dataPath('quotes.jsonl'))
    expect(records).toHaveLength(1)
    expect(Object.keys(records[0]).sort()).toEqual(['createdAt', 'message', 'name', 'phone', 'quantity', 'sport'])
    expect(records[0]).toMatchObject({ quantity: 12, sport: 'ao-bong-da' })
    expect(Number.isNaN(Date.parse(records[0].createdAt as string))).toBe(false)
  })

  it('rejects a cross-origin request', async () => {
    expect((await POST(post(valid, { origin: 'https://evil.test' }))).status).toBe(403)
  })

  it('rejects malformed or oversized bodies', async () => {
    expect((await POST(send('{oops'))).status).toBe(400)
    const huge = await POST(send(JSON.stringify({ pad: 'x'.repeat(20_001) })))
    expect(huge.status).toBe(400)
    expect(await huge.json()).toMatchObject({ error: { code: 'VALIDATION', message: 'Dữ liệu không hợp lệ.' } })
  })

  it('returns field errors keyed by field name', async () => {
    const res = await POST(post({ ...valid, quantity: 3, sport: 'giay' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({
      success: false,
      data: null,
      error: { code: 'VALIDATION', fields: { quantity: 'Số lượng tối thiểu là 5 bộ.', sport: 'Vui lòng chọn môn thể thao.' } },
    })
  })

  it('rejects a body that is not an object', async () => {
    const res = await POST(send('null'))
    expect(res.status).toBe(400)
  })

  it('rate limits to 5 requests per client', async () => {
    const ip = { 'x-forwarded-for': '9.9.9.9' }
    for (let i = 0; i < 5; i++) expect((await POST(post(valid, ip))).status).toBe(201)
    const limited = await POST(post(valid, ip))
    expect(limited.status).toBe(429)
    expect(limited.headers.get('retry-after')).toBeTruthy()
    expect(await limited.json()).toMatchObject({
      error: { code: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' },
    })
  })
})
