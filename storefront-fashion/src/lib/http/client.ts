import type { ApiResponse } from './api-response'

const NETWORK_ERROR = 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.'

const internalError = (message: string): ApiResponse<never> => ({
  success: false,
  data: null,
  error: { code: 'INTERNAL', message },
})

function isEnvelope(value: unknown): value is ApiResponse<unknown> {
  return typeof value === 'object' && value !== null && 'success' in value && 'error' in value && 'data' in value
}

/** Browser helper: never throws; network or protocol failures become an INTERNAL error. */
export async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const parsed: unknown = await response.json()
    return isEnvelope(parsed) ? (parsed as ApiResponse<T>) : internalError(NETWORK_ERROR)
  } catch {
    return internalError(NETWORK_ERROR)
  }
}
