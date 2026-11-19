import { randomUUID } from 'node:crypto'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { appendLinesText, readRecords } from './jsonl-store'
import { type ProcessLockOptions, withLock, withProcessLock } from './lock'

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
  /**
   * When the file has more than `maxLines` non-blank lines, rewrites it (tmp file + rename, under the
   * file lock) to hold only live records that pass `keep`. Resolves true when it rewrote the file.
   */
  compact(options: CompactOptions<T>): Promise<boolean>
}

export interface CompactOptions<T> {
  readonly maxLines: number
  readonly keep: (item: T) => boolean
}

/**
 * Serialises tasks per data file: first in-process (queue per path), then across processes via
 * `<file>.lock` next to the data file, so the app and CLI scripts never interleave writes.
 * Not re-entrant: never nest calls for the same file.
 */
export function withFileLock<T>(filePath: string, fn: () => Promise<T>, options?: ProcessLockOptions): Promise<T> {
  return withLock(filePath, () => withProcessLock(`${filePath}.lock`, fn, options))
}

const hasStringId = (value: unknown): value is { readonly id: string } =>
  typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string'

const isTombstone = (value: { readonly id: string }): value is Tombstone => (value as { deleted?: unknown }).deleted === true

const isTombstoneLine = (value: unknown): boolean => hasStringId(value) && isTombstone(value)

export interface CollectionOptions {
  /** Upgrades each stored line before merging (e.g. legacy lines without `id`); `null` drops the line. */
  readonly normalize?: (raw: unknown) => unknown
}

const keep = (raw: unknown): unknown => raw

function merge<T extends { readonly id: string }>(records: readonly unknown[]): readonly T[] {
  // Local accumulator only; copying the map per line would make reads quadratic.
  const latest = new Map<string, { readonly id: string }>()
  for (const record of records.filter(hasStringId)) latest.set(record.id, record)
  return [...latest.values()].filter((record) => !isTombstone(record)) as unknown as readonly T[]
}

const serialize = (records: readonly unknown[]): string => records.map((record) => `${JSON.stringify(record)}\n`).join('')

async function appendLines(filePath: string, records: readonly unknown[]): Promise<void> {
  if (records.length === 0) return
  // One append call per mutation, so a batch lands together.
  await appendLinesText(filePath, serialize(records))
}

async function countLines(filePath: string): Promise<number> {
  try {
    return (await readFile(filePath, 'utf8')).split('\n').filter((line) => line.trim() !== '').length
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0
    throw error
  }
}

/** Replaces the file in one rename, so unlocked readers see either the old or the new content. */
async function replaceFile(filePath: string, text: string): Promise<void> {
  const tmp = `${filePath}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(tmp, text, 'utf8')
    await rename(tmp, filePath)
  } catch (error) {
    await rm(tmp, { force: true })
    throw error
  }
}

/** Append-only JSONL collection keyed by `id`; writes hold the in-process and cross-process file lock. */
export function createCollection<T extends { readonly id: string }>(filePath: string, { normalize = keep }: CollectionOptions = {}): Collection<T> {
  const all = async (): Promise<readonly T[]> => merge<T>((await readRecords<unknown>(filePath)).map((raw) => (isTombstoneLine(raw) ? raw : normalize(raw))))
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
    compact: ({ maxLines, keep }) =>
      withFileLock(filePath, async () => {
        if ((await countLines(filePath)) <= maxLines) return false
        await replaceFile(filePath, serialize((await all()).filter(keep)))
        return true
      }),
  }
}
