import type { SortKey } from './types'

const SORT_KEYS: readonly SortKey[] = ['popular', 'newest', 'price-asc', 'price-desc']
const MAX_QUERY_LENGTH = 100

type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function parseListingParams(raw: RawParams): { sort: SortKey; page: number; query: string } {
  const sortRaw = first(raw.sort)
  const sort = SORT_KEYS.find((key) => key === sortRaw) ?? 'newest'

  const pageRaw = first(raw.page)
  const pageNumber = pageRaw !== undefined && /^\d+$/.test(pageRaw) ? Number(pageRaw) : 1
  const page = pageNumber >= 1 ? pageNumber : 1

  const query = (first(raw.q) ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH).trim()
  return { sort, page, query }
}
