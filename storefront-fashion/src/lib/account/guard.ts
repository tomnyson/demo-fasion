import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/current-user'
import { safeNext } from '@/lib/auth/safe-next'
import type { PublicUser } from '@/lib/auth/users'
import { ACCOUNT_PATH_HEADER, ACCOUNT_ROOT } from './constants'

/** Accepts only a same-site path inside the account area; anything else becomes `/tai-khoan`. */
export function accountPath(raw: string | null | undefined): string {
  const path = safeNext(raw)
  return path === ACCOUNT_ROOT || path.startsWith(`${ACCOUNT_ROOT}/`) ? path : ACCOUNT_ROOT
}

export const loginUrlFor = (path: string): string => `/dang-nhap?next=${encodeURIComponent(accountPath(path))}`

/** Server components: the signed-in user, or a redirect to the login page that returns to `path`. */
export async function requireAccountUser(path: string): Promise<PublicUser> {
  const user = await getCurrentUser()
  if (user === null) redirect(loginUrlFor(path))
  return user
}

/** Layouts cannot see the URL; read the path the proxy forwarded. */
export async function requestedAccountPath(): Promise<string> {
  return accountPath((await headers()).get(ACCOUNT_PATH_HEADER))
}
