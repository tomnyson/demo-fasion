import { mkdir, open, stat, unlink, type FileHandle } from 'node:fs/promises'
import { dirname } from 'node:path'

const queues = new Map<string, Promise<unknown>>()

/**
 * Runs `task` after every earlier task with the same key has settled, so check-then-write
 * sequences cannot interleave inside this process. Other processes (e.g. the order-status CLI)
 * are kept out by `withProcessLock`, which `withFileLock` takes on top of this.
 */
export function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve()
  const run = previous.then(task, task)
  const settled = run.then(
    () => undefined,
    () => undefined,
  )
  queues.set(key, settled)
  void settled.then(() => {
    if (queues.get(key) === settled) queues.delete(key)
  })
  return run
}

export interface ProcessLockOptions {
  /** Wait between attempts while another holder has the lock. */
  readonly retryMs?: number
  /** Give up and throw after waiting this long. */
  readonly timeoutMs?: number
  /** A lock file older than this is assumed left by a crashed holder and removed. */
  readonly staleMs?: number
}

const DEFAULT_RETRY_MS = 25
const DEFAULT_TIMEOUT_MS = 5_000
const DEFAULT_STALE_MS = 30_000

const errorCode = (error: unknown): string | undefined => (error as NodeJS.ErrnoException).code

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Removes the lock file if it is older than `staleMs`; true when it is gone (or was never there). */
async function clearIfStale(lockPath: string, staleMs: number): Promise<boolean> {
  try {
    const { mtimeMs } = await stat(lockPath)
    if (Date.now() - mtimeMs <= staleMs) return false
    await unlink(lockPath)
    return true
  } catch (error) {
    if (errorCode(error) === 'ENOENT') return true
    throw error
  }
}

async function acquire(lockPath: string, { retryMs, timeoutMs, staleMs }: Required<ProcessLockOptions>): Promise<FileHandle> {
  await mkdir(dirname(lockPath), { recursive: true })
  const deadline = Date.now() + timeoutMs
  for (;;) {
    try {
      const handle = await open(lockPath, 'wx')
      // The pid is informational only (for a human deciding whether a lock is abandoned).
      await handle.writeFile(`${process.pid}\n`).catch(async (error: unknown) => {
        await release(handle, lockPath)
        throw error
      })
      return handle
    } catch (error) {
      if (errorCode(error) !== 'EEXIST') throw error
    }
    if (await clearIfStale(lockPath, staleMs)) continue
    if (Date.now() >= deadline) throw new Error(`Timed out after ${timeoutMs} ms waiting for the lock ${lockPath}; if no other process is using it, delete the file.`)
    await sleep(retryMs)
  }
}

async function release(handle: FileHandle, lockPath: string): Promise<void> {
  try {
    await handle.close()
  } finally {
    try {
      await unlink(lockPath)
    } catch (error) {
      if (errorCode(error) !== 'ENOENT') throw error
    }
  }
}

/**
 * Cross-process mutual exclusion through an exclusively created lock file (`open(path, 'wx')`).
 * Retries every `retryMs` up to `timeoutMs`; removes a lock older than `staleMs`. Not re-entrant.
 */
export async function withProcessLock<T>(lockPath: string, task: () => Promise<T>, options: ProcessLockOptions = {}): Promise<T> {
  const handle = await acquire(lockPath, {
    retryMs: options.retryMs ?? DEFAULT_RETRY_MS,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    staleMs: options.staleMs ?? DEFAULT_STALE_MS,
  })
  try {
    return await task()
  } finally {
    await release(handle, lockPath)
  }
}
