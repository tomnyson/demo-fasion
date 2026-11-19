import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createCollection, withFileLock } from './collection'

interface Item {
  readonly id: string
  readonly n: number
}

let dir: string
let file: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'collection-'))
  file = join(dir, 'nested/items.jsonl')
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('createCollection', () => {
  it('returns [] and null for a missing file', async () => {
    const items = createCollection<Item>(file)
    expect(await items.all()).toEqual([])
    expect(await items.get('a')).toBeNull()
  })

  it('lets the newest record with an id win', async () => {
    const items = createCollection<Item>(file)
    await items.put({ id: 'a', n: 1 })
    await items.put({ id: 'b', n: 1 })
    await items.put({ id: 'a', n: 2 })
    expect(await items.get('a')).toEqual({ id: 'a', n: 2 })
    expect(await items.all()).toEqual([
      { id: 'a', n: 2 },
      { id: 'b', n: 1 },
    ])
  })

  it('hides removed records and lets a later put bring them back', async () => {
    const items = createCollection<Item>(file)
    await items.put({ id: 'a', n: 1 })
    await items.remove('a')
    expect(await items.get('a')).toBeNull()
    expect(await items.all()).toEqual([])
    await items.put({ id: 'a', n: 3 })
    expect(await items.get('a')).toEqual({ id: 'a', n: 3 })
  })

  it('skips broken lines and records without a string id', async () => {
    await writeFile(join(dir, 'raw.jsonl'), '{"id":"a","n":1}\nnot json\n{"n":2}\n{"id":5}\nnull\n{"id":"b","n":2}\n')
    const items = createCollection<Item>(join(dir, 'raw.jsonl'))
    expect(await items.all()).toEqual([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
    ])
  })

  it('serialises 20 parallel read-decide-write mutations', async () => {
    const items = createCollection<Item>(file)
    const bump = () =>
      items.mutate((all) => {
        const current = all.find((item) => item.id === 'counter')?.n ?? 0
        return { writes: [{ id: 'counter', n: current + 1 }], result: current + 1 }
      })
    const results = await Promise.all(Array.from({ length: 20 }, bump))
    expect((await items.get('counter'))?.n).toBe(20)
    expect([...results].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })

  it('writes several records and tombstones from one mutation and skips the write when empty', async () => {
    const items = createCollection<Item>(file)
    await items.put({ id: 'gone', n: 0 })
    const result = await items.mutate(() => ({
      writes: [{ id: 'x', n: 1 }, { id: 'y', n: 2 }, { id: 'gone', deleted: true as const }],
      result: 'done',
    }))
    expect(result).toBe('done')
    expect(await items.all()).toEqual([
      { id: 'x', n: 1 },
      { id: 'y', n: 2 },
    ])
    const before = await readFile(file, 'utf8')
    expect(await items.mutate(() => ({ writes: [], result: 7 }))).toBe(7)
    expect(await readFile(file, 'utf8')).toBe(before)
  })

  it('does not write when the decision throws', async () => {
    const items = createCollection<Item>(file)
    await expect(
      items.mutate(() => {
        throw new Error('nope')
      }),
    ).rejects.toThrow('nope')
    expect(await items.all()).toEqual([])
  })
})

describe('withFileLock', () => {
  it('runs tasks for one file one at a time', async () => {
    let counter = 0
    const bump = async () => {
      const seen = counter
      await new Promise((resolve) => setTimeout(resolve, 1))
      counter = seen + 1
    }
    await Promise.all(Array.from({ length: 10 }, () => withFileLock(file, bump)))
    expect(counter).toBe(10)
  })
})
