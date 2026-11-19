import { randomUUID } from 'node:crypto'
import { createCollection, type Mutation, type Tombstone } from '@/lib/storage/collection'
import { dataPath } from '@/lib/storage/jsonl-store'
import { ADDRESS_LIMIT_MESSAGE, MAX_ADDRESSES } from './limits'
import type { Address, AddressInput } from './schema'

export { ADDRESS_LIMIT_MESSAGE, MAX_ADDRESSES }
export type { Address, AddressInput }

export const ADDRESSES_FILE = 'addresses.jsonl'

export type AddResult = { readonly ok: true; readonly address: Address } | { readonly ok: false; readonly message: string }

export interface AddressRepository {
  /** The user's book: default first, then newest first. */
  listFor(userId: string): Promise<readonly Address[]>
  /** `null` when the id is unknown or belongs to someone else. */
  getOwned(userId: string, id: string): Promise<Address | null>
  add(userId: string, input: AddressInput): Promise<AddResult>
  update(userId: string, id: string, input: AddressInput): Promise<Address | null>
  /** `false` when the id is unknown or belongs to someone else. */
  remove(userId: string, id: string): Promise<boolean>
  setDefault(userId: string, id: string): Promise<Address | null>
}

const newestFirst = (a: Address, b: Address): number => b.createdAt.localeCompare(a.createdAt)

/** Default first, then newest first. Returns a new array. */
export function sortAddresses(addresses: readonly Address[]): readonly Address[] {
  return [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || newestFirst(a, b))
}

const ownedBy = (all: readonly Address[], userId: string): readonly Address[] => all.filter((a) => a.userId === userId)
const findOwned = (all: readonly Address[], userId: string, id: string): Address | undefined =>
  all.find((a) => a.id === id && a.userId === userId)

const unchanged = <R>(result: R): Mutation<Address, R> => ({ writes: [], result })

function decideAdd(all: readonly Address[], userId: string, input: AddressInput, now: Date): Mutation<Address, AddResult> {
  const book = ownedBy(all, userId)
  if (book.length >= MAX_ADDRESSES) return unchanged({ ok: false, message: ADDRESS_LIMIT_MESSAGE })
  const address: Address = { ...input, id: randomUUID(), userId, isDefault: book.length === 0, createdAt: now.toISOString() }
  return { writes: [address], result: { ok: true, address } }
}

function decideRemove(all: readonly Address[], userId: string, id: string): Mutation<Address, boolean> {
  const target = findOwned(all, userId, id)
  if (target === undefined) return unchanged(false)
  const tombstone: Tombstone = { id, deleted: true }
  const heir = target.isDefault ? [...ownedBy(all, userId)].filter((a) => a.id !== id).sort(newestFirst)[0] : undefined
  return { writes: heir === undefined ? [tombstone] : [tombstone, { ...heir, isDefault: true }], result: true }
}

function decideSetDefault(all: readonly Address[], userId: string, id: string): Mutation<Address, Address | null> {
  const target = findOwned(all, userId, id)
  if (target === undefined) return unchanged(null)
  const next = { ...target, isDefault: true }
  const demoted = ownedBy(all, userId)
    .filter((a) => a.isDefault && a.id !== id)
    .map((a) => ({ ...a, isDefault: false }))
  return { writes: target.isDefault ? demoted : [...demoted, next], result: next }
}

/** Address book on an append-only collection. Every write goes through `mutate` so the cap and the single default hold. */
export function createAddressRepository(filePath: string = dataPath(ADDRESSES_FILE), now: () => Date = () => new Date()): AddressRepository {
  const addresses = createCollection<Address>(filePath)
  return {
    listFor: async (userId) => sortAddresses(ownedBy(await addresses.all(), userId)),
    getOwned: async (userId, id) => findOwned(await addresses.all(), userId, id) ?? null,
    add: (userId, input) => addresses.mutate((all) => decideAdd(all, userId, input, now())),
    update: (userId, id, input) =>
      addresses.mutate((all) => {
        const current = findOwned(all, userId, id)
        if (current === undefined) return unchanged(null)
        const next: Address = { ...current, ...input, id: current.id, userId: current.userId }
        return { writes: [next], result: next }
      }),
    remove: (userId, id) => addresses.mutate((all) => decideRemove(all, userId, id)),
    setDefault: (userId, id) => addresses.mutate((all) => decideSetDefault(all, userId, id)),
  }
}
