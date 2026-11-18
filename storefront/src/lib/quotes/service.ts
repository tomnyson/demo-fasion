import type { QuoteRepository } from './repository'
import { quoteInputSchema } from './schema'

export type SubmitQuoteResult = { ok: true } | { ok: false; fields: Record<string, string> }

interface SubmitQuoteDeps {
  readonly repo: QuoteRepository
  readonly now: () => Date
}

function toFields(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  return issues.reduce<Record<string, string>>((fields, issue) => {
    const key = issue.path.length === 0 ? 'form' : issue.path.map(String).join('.')
    return key in fields ? fields : { ...fields, [key]: issue.message }
  }, {})
}

export async function submitQuote(input: unknown, deps: SubmitQuoteDeps): Promise<SubmitQuoteResult> {
  const parsed = quoteInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, fields: toFields(parsed.error.issues) }
  await deps.repo.create({ ...parsed.data, createdAt: deps.now().toISOString() })
  return { ok: true }
}
