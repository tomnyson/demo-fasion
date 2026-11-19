import { mkdir, mkdtemp, readdir, readFile, rm, stat, unlink, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
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

  it('upgrades lines with `normalize` before merging and never passes it tombstones', async () => {
    await writeFile(file.replace('nested/', ''), '{"key":"a","n":1}\n{"key":"b","n":1}\nnot json\n{"id":"b","deleted":true}\n')
    const seen: unknown[] = []
    const items = createCollection<Item>(file.replace('nested/', ''), {
      normalize: (raw) => {
        seen.push(raw)
        const r = raw as { key?: string; n: number }
        return r.key === undefined ? null : { id: r.key, n: r.n }
      },
    })
    expect(await items.all()).toEqual([{ id: 'a', n: 1 }])
    expect(seen).toHaveLength(2)
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

  it('does not glue a new record onto a torn last line', async () => {
    const raw = join(dir, 'torn.jsonl')
    await writeFile(raw, '{"id":"a","n":1}\n{"id":"b","n"')
    const items = createCollection<Item>(raw)
    await items.put({ id: 'c', n: 3 })
    expect(await items.all()).toEqual([
      { id: 'a', n: 1 },
      { id: 'c', n: 3 },
    ])
  })

  it('compacts to the kept live records once the file exceeds a line count', async () => {
    const items = createCollection<Item>(file)
    await items.put({ id: 'a', n: 1 })
    await items.put({ id: 'a', n: 2 })
    await items.put({ id: 'b', n: 1 })
    await items.remove('b')
    await items.put({ id: 'old', n: 0 })
    expect(await items.compact({ maxLines: 10, keep: () => true })).toBe(false)
    expect(await items.compact({ maxLines: 4, keep: (item) => item.n > 0 })).toBe(true)
    expect(await readFile(file, 'utf8')).toBe('{"id":"a","n":2}\n')
    expect(await readdir(dirname(file))).toEqual(['items.jsonl'])
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

describe('cross-process file lock', () => {
  const lockFile = () => `${file}.lock`
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  const exists = (path: string) =>
    stat(path).then(
      () => true,
      () => false,
    )
  const holdLock = async () => {
    await mkdir(dirname(file), { recursive: true })
    await writeFile(lockFile(), 'other-process')
  }

  it('waits while another process holds <file>.lock, then proceeds once it is released', async () => {
    await holdLock()
    const items = createCollection<Item>(file)
    let done = false
    const pending = items.mutate(() => ({ writes: [{ id: 'a', n: 1 }], result: 'ok' })).then((value) => {
      done = true
      return value
    })
    await sleep(120)
    expect(done).toBe(false)
    await unlink(lockFile())
    expect(await pending).toBe('ok')
    expect(await items.get('a')).toEqual({ id: 'a', n: 1 })
    expect(await exists(lockFile())).toBe(false)
  })

  it('serialises mutations from two collection instances on one file', async () => {
    const first = createCollection<Item>(file)
    const second = createCollection<Item>(file)
    const bump = (items: typeof first) =>
      items.mutate((all) => ({ writes: [{ id: 'c', n: (all.find((item) => item.id === 'c')?.n ?? 0) + 1 }], result: undefined }))
    await Promise.all(Array.from({ length: 10 }, (_, i) => bump(i % 2 === 0 ? first : second)))
    expect((await first.get('c'))?.n).toBe(10)
  })

  it('removes a lock older than the stale threshold and proceeds', async () => {
    await holdLock()
    const old = new Date(Date.now() - 31_000)
    await utimes(lockFile(), old, old)
    const started = Date.now()
    await withFileLock(file, async () => undefined)
    expect(Date.now() - started).toBeLessThan(1000)
    expect(await exists(lockFile())).toBe(false)
  })

  it('gives up with a clear error when the lock is never released', async () => {
    await holdLock()
    await expect(withFileLock(file, async () => 'never', { timeoutMs: 100, retryMs: 10 })).rejects.toThrow(/Timed out .* lock .*items\.jsonl\.lock/)
    expect(await exists(lockFile())).toBe(true)
  })

  it('releases the lock when the task throws', async () => {
    const items = createCollection<Item>(file)
    await expect(
      items.mutate(() => {
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')
    expect(await exists(lockFile())).toBe(false)
    const started = Date.now()
    await items.put({ id: 'a', n: 1 })
    expect(Date.now() - started).toBeLessThan(1000)
  })
})
