import type { ReactNode } from 'react'

const INPUT_CLASS =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-[invalid=true]:border-accent'

interface FormFieldProps {
  readonly idPrefix: string
  readonly name: string
  readonly label: string
  readonly error: string | undefined
  readonly children: (props: { id: string; name: string; className: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}

/** Label + control + error text, wired together with aria-invalid / aria-describedby. */
export function FormField({ idPrefix, name, label, error, children }: FormFieldProps) {
  const id = `${idPrefix}-${name}`
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({
        id,
        name,
        className: INPUT_CLASS,
        ...(error === undefined ? {} : { 'aria-invalid': true as const, 'aria-describedby': errorId }),
      })}
      {error === undefined ? null : (
        <p id={errorId} className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  )
}
