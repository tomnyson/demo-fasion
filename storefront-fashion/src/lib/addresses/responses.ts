import { ADDRESS_NOT_FOUND, notFound } from '@/lib/account/route-auth'
import { authHeaders } from '@/lib/auth/session-response'
import { ok } from '@/lib/http/api-response'
import type { AddressRepository } from './repository'
import type { Address } from './schema'

export interface AddressBookPayload {
  readonly address?: Address
  readonly addresses: readonly Address[]
}

/** Every address response carries the whole sorted book, so the client just replaces its list. */
export async function bookResponse(repo: AddressRepository, userId: string, address?: Address, status = 200): Promise<Response> {
  const payload: AddressBookPayload = { ...(address === undefined ? {} : { address }), addresses: await repo.listFor(userId) }
  return ok(payload, status, authHeaders())
}

export const addressNotFound = (): Response => notFound(ADDRESS_NOT_FOUND)
