import { afterEach, describe, expect, it, vi } from 'vitest'
import { postJson, sendJson } from './client'

afterEach(() => vi.unstubAllGlobals())

describe('postJson', () => {
  it('posts JSON and returns the parsed envelope', async () => {
    const envelope = { success: true, data: { code: 'X' }, error: null }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await postJson('/api/x', { a: 1 })).toEqual(envelope)
    expect(fetchMock).toHaveBeenCalledWith('/api/x', expect.objectContaining({ method: 'POST', body: '{"a":1}' }))
  })

  it('maps a network failure to an INTERNAL error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    const res = await postJson('/api/x', {})
    expect(res).toMatchObject({ success: false, data: null, error: { code: 'INTERNAL' } })
  })

  it('maps a non-envelope response to an INTERNAL error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })))
    expect(await postJson('/api/x', {})).toMatchObject({ success: false, error: { code: 'INTERNAL' } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"foo":1}')))
    expect(await postJson('/api/x', {})).toMatchObject({ success: false, error: { code: 'INTERNAL' } })
  })
})

describe('sendJson', () => {
  it('sends other methods and omits an undefined body', async () => {
    const envelope = { success: true, data: null, error: null }
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(envelope)))
    vi.stubGlobal('fetch', fetchMock)
    expect(await sendJson('DELETE', '/api/x/1')).toEqual(envelope)
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty('body')
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'DELETE' })
    await sendJson('PATCH', '/api/x/1', { a: 2 })
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PATCH', body: '{"a":2}' })
  })
})
