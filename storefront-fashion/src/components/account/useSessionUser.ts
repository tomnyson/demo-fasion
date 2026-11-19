'use client'

import { useEffect, useState } from 'react'

export interface SessionSummary {
  readonly signedIn: boolean
  readonly name?: string
}

const SIGNED_OUT: SessionSummary = { signedIn: false }

let pending: Promise<SessionSummary> | null = null

async function fetchSession(): Promise<SessionSummary> {
  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'same-origin' })
    const body: unknown = await response.json()
    const user = (body as { data?: { user?: { name?: unknown } | null } } | null)?.data?.user
    return user && typeof user.name === 'string' ? { signedIn: true, name: user.name } : SIGNED_OUT
  } catch {
    // Offline or a server error: show the sign-in link, which still works.
    return SIGNED_OUT
  }
}

/** One `/api/auth/me` request per page load, shared by every caller (header icon, mobile menu). */
function loadSession(): Promise<SessionSummary> {
  pending ??= fetchSession()
  return pending
}

/** Test hook: forget the cached answer. */
export function resetSessionCache(): void {
  pending = null
}

/**
 * Client-side session lookup so the root layout stays static. Starts as signed out (the link works
 * without JS); after a sign-in or sign-out the app does a full page load, which refreshes this.
 */
export function useSessionUser(): SessionSummary {
  const [session, setSession] = useState<SessionSummary>(SIGNED_OUT)
  useEffect(() => {
    let active = true
    void loadSession().then((next) => {
      if (active && next.signedIn) setSession(next)
    })
    return () => {
      active = false
    }
  }, [])
  return session
}
