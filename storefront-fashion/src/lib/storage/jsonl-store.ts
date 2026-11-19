import { appendFile, type FileHandle, mkdir, open, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

/**
 * Data folder: DATA_DIR, else the writable temp folder on Vercel (its code folder is read-only;
 * demo only — data there is per instance and lost on restart), else `.data`.
 */
function dataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR
  return process.env.VERCEL ? join(tmpdir(), 'storefront-data') : '.data'
}

export function dataPath(fileName: string): string {
  // Runtime data directory, not a build asset: keep the bundler from tracing the whole project.
  return join(/*turbopackIgnore: true*/ dataDir(), fileName)
}

const NEWLINE = 0x0a

/** True when the file exists, is non-empty and its last byte is not a newline (a torn write). */
async function endsMidLine(filePath: string): Promise<boolean> {
  let handle: FileHandle
  try {
    handle = await open(filePath, 'r')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
  try {
    const { size } = await handle.stat()
    if (size === 0) return false
    const { buffer } = await handle.read(Buffer.alloc(1), 0, 1, size - 1)
    return buffer[0] !== NEWLINE
  } finally {
    await handle.close()
  }
}

/**
 * Appends pre-serialised JSONL text (each line ending in `\n`). If the file ends in a torn line,
 * a newline goes first so the new records are not glued onto it and lost on read.
 */
export async function appendLinesText(filePath: string, text: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  const prefix = (await endsMidLine(filePath)) ? '\n' : ''
  await appendFile(filePath, `${prefix}${text}`, 'utf8')
}

export async function appendRecord(filePath: string, record: unknown): Promise<void> {
  await appendLinesText(filePath, `${JSON.stringify(record)}\n`)
}

function parseLine<T>(line: string): readonly T[] {
  if (line.trim() === '') return []
  try {
    return [JSON.parse(line) as T]
  } catch {
    return []
  }
}

export async function readRecords<T>(filePath: string): Promise<readonly T[]> {
  let text: string
  try {
    text = await readFile(filePath, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
  return text.split('\n').flatMap((line) => parseLine<T>(line))
}
