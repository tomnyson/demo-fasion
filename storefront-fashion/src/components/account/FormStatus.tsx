/** Form-level error alert and success notice shared by the account forms. */
export function FormStatus({ error, notice }: { readonly error: string | null; readonly notice: string | null }) {
  if (error !== null)
    return (
      <p role="alert" className="text-sm font-semibold text-price">
        {error}
      </p>
    )
  if (notice !== null)
    return (
      <p role="status" className="text-sm font-semibold text-brand-strong">
        {notice}
      </p>
    )
  return null
}
