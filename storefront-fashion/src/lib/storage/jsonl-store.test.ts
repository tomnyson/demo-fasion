import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appendRecord, dataPath, readRecords } from './jsonl-store'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'jsonl-'))
})
afterEach(async () => {
  vi.unstubAllEnvs()
  await rm(dir, { recursive: true, force: true })
})

describe('jsonl-store', () => {
  it('returns [] for a missing file', async () => {
    expect(await readRecords(join(dir, 'missing.jsonl'))).toEqual([])
  })

  it('creates directories and appends one JSON line per record', async () => {
    await appendRecord(join(dir, 'deep/a.jsonl'), { n: 1 })
    await appendRecord(join(dir, 'deep/a.jsonl'), { n: 2 })
    expect(await readRecords(join(dir, 'deep/a.jsonl'))).toEqual([{ n: 1 }, { n: 2 }])
  })

  it('starts a new line when the file ends in a torn (unterminated) line', async () => {
    const file = join(dir, 'torn.jsonl')
    await writeFile(file, '{"n":1}\n{"n":2,"tru')
    await appendRecord(file, { n: 3 })
    expect(await readFile(file, 'utf8')).toBe('{"n":1}\n{"n":2,"tru\n{"n":3}\n')
    expect(await readRecords(file)).toEqual([{ n: 1 }, { n: 3 }])
  })

  it('adds no blank line to an empty file', async () => {
    const file = join(dir, 'empty.jsonl')
    await writeFile(file, '')
    await appendRecord(file, { n: 1 })
    expect(await readFile(file, 'utf8')).toBe('{"n":1}\n')
  })

  it('skips blank and unparsable lines', async () => {
    await writeFile(join(dir, 'b.jsonl'), '{"n":1}\ngarbage\n\n{"n":3}\n')
    expect(await readRecords(join(dir, 'b.jsonl'))).toEqual([{ n: 1 }, { n: 3 }])
  })

  it('rethrows read errors other than a missing file', async () => {
    await expect(readRecords(dir)).rejects.toThrow()
  })

  it('resolves dataPath from DATA_DIR, defaulting to .data', () => {
    vi.stubEnv('DATA_DIR', dir)
    expect(dataPath('orders.jsonl')).toBe(join(dir, 'orders.jsonl'))
    vi.stubEnv('DATA_DIR', '')
    delete process.env.DATA_DIR
    expect(dataPath('orders.jsonl')).toBe(join('.data', 'orders.jsonl'))
  })

  it('uses the writable temp folder on Vercel unless DATA_DIR is set', () => {
    vi.stubEnv('DATA_DIR', '')
    vi.stubEnv('VERCEL', '1')
    expect(dataPath('users.jsonl')).toBe(join(tmpdir(), 'storefront-data', 'users.jsonl'))
    vi.stubEnv('DATA_DIR', dir)
    expect(dataPath('users.jsonl')).toBe(join(dir, 'users.jsonl'))
  })
})
