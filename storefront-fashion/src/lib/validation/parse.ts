import type { z } from 'zod'

export type FieldErrors = Readonly<Record<string, string>>

export type ParseResult<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly fields: FieldErrors }

/** Maps zod issues to `{ 'a.b': message }`, keeping the first message per field; root issues go under `form`. */
export function issuesToFields(issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((fields, issue) => {
    const key = issue.path.length === 0 ? 'form' : issue.path.map(String).join('.')
    return key in fields ? fields : { ...fields, [key]: issue.message }
  }, {})
}

export function parseInput<S extends z.ZodType>(schema: S, input: unknown): ParseResult<z.output<S>> {
  const parsed = schema.safeParse(input)
  return parsed.success ? { ok: true, data: parsed.data } : { ok: false, fields: issuesToFields(parsed.error.issues) }
}
