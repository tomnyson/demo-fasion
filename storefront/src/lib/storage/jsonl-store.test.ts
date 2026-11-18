import { mkdtemp, rm, writeFile } from 'node:fs/promises'
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
})
