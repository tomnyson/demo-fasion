import type { AddressRepository } from '@/lib/addresses/repository'
import { addressInputSchema, type Address } from '@/lib/addresses/schema'
import { MESSAGES, type OrderCustomer, type OrderInput } from './schema'

export interface RecipientDeps {
  /** Set when the customer is signed in; saved addresses are only looked up in this user's book. */
  readonly userId?: string
  readonly addresses?: AddressRepository
}

export type RecipientResult = { readonly ok: true; readonly customer: OrderCustomer } | { readonly ok: false; readonly fields: Record<string, string> }

const ADDRESS_ERROR: RecipientResult = { ok: false, fields: { addressId: MESSAGES.addressId } }

function fromAddress(address: Address, extras: Pick<OrderCustomer, 'email' | 'note'> = {}): OrderCustomer {
  return {
    name: address.recipient,
    phone: address.phone,
    ...(extras.email === undefined ? {} : { email: extras.email }),
    province: address.province,
    address: address.address,
    ...(extras.note === undefined ? {} : { note: extras.note }),
  }
}

/** The order's recipient: as typed, or copied from the signed-in customer's own saved address. */
export async function resolveRecipient(input: OrderInput, deps: RecipientDeps): Promise<RecipientResult> {
  if (input.addressId === undefined) return { ok: true, customer: input.customer }
  if (deps.userId === undefined || deps.addresses === undefined) return ADDRESS_ERROR
  const address = await deps.addresses.getOwned(deps.userId, input.addressId)
  return address === null ? ADDRESS_ERROR : { ok: true, customer: fromAddress(address, input.customer) }
}

const sameAddress = (a: Address, b: Omit<Address, 'id' | 'userId' | 'isDefault' | 'createdAt'>): boolean =>
  a.recipient === b.recipient && a.phone === b.phone && a.province === b.province && a.address === b.address

/**
 * Best effort: keeps a typed recipient in the address book after the order is stored. Skips it when
 * it does not fit the book (e.g. a province outside the list), is already there, or the book is full.
 * Never fails the order.
 */
export async function saveRecipient(customer: OrderCustomer, deps: RecipientDeps): Promise<void> {
  const { userId, addresses } = deps
  if (userId === undefined || addresses === undefined) return
  const parsed = addressInputSchema.safeParse({ recipient: customer.name, phone: customer.phone, province: customer.province, address: customer.address })
  if (!parsed.success) return
  try {
    const book = await addresses.listFor(userId)
    if (book.some((entry) => sameAddress(entry, parsed.data))) return
    await addresses.add(userId, parsed.data)
  } catch (error) {
    console.error('[placeOrder] could not save the address to the book', { userId, error })
  }
}
