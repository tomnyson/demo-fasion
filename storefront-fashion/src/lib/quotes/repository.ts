import { appendRecord, dataPath } from '@/lib/storage/jsonl-store'
import type { QuoteInput } from './schema'

export interface QuoteRepository {
  create(quote: QuoteInput & { createdAt: string }): Promise<void>
}

export function createFileQuoteRepository(filePath: string = dataPath('quotes.jsonl')): QuoteRepository {
  return { create: (quote) => appendRecord(filePath, quote) }
}
