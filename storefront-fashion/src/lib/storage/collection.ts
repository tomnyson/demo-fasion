import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { readRecords } from './jsonl-store'
import { withLock } from './lock'

/** Marks a record as deleted; later lines with the same id win over it. */
export interface Tombstone {
  readonly id: string
  readonly deleted: true
}

export type CollectionWrite<T> = T | Tombstone

export interface Mutation<T, R> {
  readonly writes: readonly CollectionWrite<T>[]
  readonly result: R
}

export interface Collection<T extends { readonly id: string }> {
  /** Every live record, merged by id with the newest line winning. */
  all(): Promise<readonly T[]>
  get(id: string): Promise<T | null>
  put(record: T): Promise<void>
  remove(id: string): Promise<void>
  /** Reads, lets `decide` choose what to write, then appends, all under the file lock. `decide` must not call back into this collection. */
  mutate<R>(decide: (items: readonly T[]) => Mutation<T, R>): Promise<R>
}

/** Serialises tasks per data file inside this process. Not re-entrant: never nest calls for the same file. */
export function withFileLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  return withLock(filePath, fn)
}

const hasStringId = (value: unknown): value is { readonly id: string } =>
  typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string'

const isTombstone = (value: { readonly id: string }): value is Tombstone => (value as { deleted?: unknown }).deleted === true

function merge<T extends { readonly id: string }>(records: readonly unknown[]): readonly T[] {
  // Local accumulator only; copying the map per line would make reads quadratic.
  const latest = new Map<string, { readonly id: string }>()
  for (const record of records.filter(hasStringId)) latest.set(record.id, record)
  return [...latest.values()].filter((record) => !isTombstone(record)) as unknown as readonly T[]
}

async function appendLines(filePath: string, records: readonly unknown[]): Promise<void> {
  if (records.length === 0) return
  await mkdir(dirname(filePath), { recursive: true })
  // One append call per mutation, so a batch lands together.
  await appendFile(filePath, records.map((record) => `${JSON.stringify(record)}\n`).join(''), 'utf8')
}

/** Append-only JSONL collection keyed by `id`, with in-process locking per file. */
export function createCollection<T extends { readonly id: string }>(filePath: string): Collection<T> {
  const all = async (): Promise<readonly T[]> => merge<T>(await readRecords<unknown>(filePath))
  const write = (records: readonly CollectionWrite<T>[]) => withFileLock(filePath, () => appendLines(filePath, records))
  return {
    all,
    async get(id) {
      return (await all()).find((record) => record.id === id) ?? null
    },
    put: (record) => write([record]),
    remove: (id) => write([{ id, deleted: true }]),
    mutate: (decide) =>
      withFileLock(filePath, async () => {
        const { writes, result } = decide(await all())
        await appendLines(filePath, writes)
        return result
      }),
  }
}
