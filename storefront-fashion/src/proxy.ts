import { NextResponse, type NextRequest } from 'next/server'
import { ACCOUNT_PATH_HEADER } from '@/lib/account/constants'

/** Forwards the account page path to the /tai-khoan layout (layouts cannot read the URL), for the login `next`. */
export function proxy(request: NextRequest): NextResponse {
  const forwarded = new Headers(request.headers)
  // Always overwrite: a client-sent value must never reach the layout.
  forwarded.set(ACCOUNT_PATH_HEADER, request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: forwarded } })
}

export const config = { matcher: ['/tai-khoan', '/tai-khoan/:path*'] }
