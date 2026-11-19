import { getRequestUser } from '@/lib/auth/current-user'
import { authHeaders } from '@/lib/auth/session-response'
import type { PublicUser } from '@/lib/auth/users'
import { fail } from '@/lib/http/api-response'

export const SIGN_IN_REQUIRED = 'Vui lòng đăng nhập để tiếp tục.'
export const ADDRESS_NOT_FOUND = 'Không tìm thấy địa chỉ.'

export const unauthorized = (): Response => fail(401, { code: 'UNAUTHORIZED', message: SIGN_IN_REQUIRED }, authHeaders())

export const notFound = (message: string): Response => fail(404, { code: 'NOT_FOUND', message }, authHeaders())

export const invalid = (fields: Readonly<Record<string, string>>, message = 'Dữ liệu không hợp lệ.'): Response =>
  fail(400, { code: 'VALIDATION', message, fields }, authHeaders())

/** Runs `fn` with the signed-in user, or answers 401 without calling it. */
export async function withRequestUser(request: Request, fn: (user: PublicUser) => Promise<Response>): Promise<Response> {
  const user = await getRequestUser(request)
  return user === null ? unauthorized() : fn(user)
}
