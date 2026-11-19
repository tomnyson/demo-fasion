import type { ApiResponse } from './api-response'

const NETWORK_ERROR = 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.'

export type JsonMethod = 'POST' | 'PATCH' | 'DELETE'

const internalError = (message: string): ApiResponse<never> => ({
  success: false,
  data: null,
  error: { code: 'INTERNAL', message },
})

function isEnvelope(value: unknown): value is ApiResponse<unknown> {
  return typeof value === 'object' && value !== null && 'success' in value && 'error' in value && 'data' in value
}

/** Browser helper: never throws; network or protocol failures become an INTERNAL error. `body` undefined sends no body. */
export async function sendJson<T>(method: JsonMethod, url: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const parsed: unknown = await response.json()
    return isEnvelope(parsed) ? (parsed as ApiResponse<T>) : internalError(NETWORK_ERROR)
  } catch {
    return internalError(NETWORK_ERROR)
  }
}

export function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return sendJson<T>('POST', url, body)
}
