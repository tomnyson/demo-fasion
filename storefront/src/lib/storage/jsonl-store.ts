import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export function dataPath(fileName: string): string {
  // Runtime data directory, not a build asset: keep the bundler from tracing the whole project.
  return join(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? '.data', fileName)
}

export async function appendRecord(filePath: string, record: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  await appendFile(filePath, `${JSON.stringify(record)}\n`, 'utf8')
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
