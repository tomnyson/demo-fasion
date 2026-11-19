export interface ApiError {
  readonly code: 'VALIDATION' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'NOT_FOUND' | 'INTERNAL'
  readonly message: string
  readonly fields?: Readonly<Record<string, string>>
}

export type ApiResponse<T> =
  | { readonly success: true; readonly data: T; readonly error: null }
  | { readonly success: false; readonly data: null; readonly error: ApiError }

export function ok<T>(data: T, status = 200, headers?: HeadersInit): Response {
  const body: ApiResponse<T> = { success: true, data, error: null }
  return Response.json(body, { status, headers })
}

export function fail(status: number, error: ApiError, headers?: HeadersInit): Response {
  const body: ApiResponse<never> = { success: false, data: null, error }
  return Response.json(body, { status, headers })
}
