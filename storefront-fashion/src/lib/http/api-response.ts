export interface ApiError {
  readonly code: 'VALIDATION' | 'FORBIDDEN' | 'RATE_LIMITED' | 'NOT_FOUND' | 'INTERNAL'
  readonly message: string
  readonly fields?: Readonly<Record<string, string>>
}

export type ApiResponse<T> =
  | { readonly success: true; readonly data: T; readonly error: null }
  | { readonly success: false; readonly data: null; readonly error: ApiError }

export function ok<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data, error: null }
  return Response.json(body, { status })
}

export function fail(status: number, error: ApiError, headers?: Record<string, string>): Response {
  const body: ApiResponse<never> = { success: false, data: null, error }
  return Response.json(body, { status, headers })
}
