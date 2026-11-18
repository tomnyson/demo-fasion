import { afterEach, describe, expect, it, vi } from 'vitest'
import { postJson } from './client'

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
