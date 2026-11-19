import { z } from 'zod'
import { invalid, withRequestUser } from '@/lib/account/route-auth'
import { createAddressRepository, type AddressRepository } from '@/lib/addresses/repository'
import { addressNotFound, bookResponse } from '@/lib/addresses/responses'
import { addressInputSchema } from '@/lib/addresses/schema'
import { handleJsonRoute } from '@/lib/http/json-route'
import { createRateLimiter } from '@/lib/http/rate-limit'
import { parseInput } from '@/lib/validation/parse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 })

/** `{ "isDefault": true }` (and nothing else) makes the address the default; any other body is a full edit. */
const setDefaultSchema = z.strictObject({ isDefault: z.literal(true) })

interface RouteContext {
  readonly params: Promise<{ id: string }>
}

async function patchAddress(repo: AddressRepository, userId: string, id: string, body: unknown): Promise<Response> {
  if (setDefaultSchema.safeParse(body).success) {
    const address = await repo.setDefault(userId, id)
    return address === null ? addressNotFound() : bookResponse(repo, userId, address)
  }
  const parsed = parseInput(addressInputSchema, body)
  if (!parsed.ok) return invalid(parsed.fields)
  const address = await repo.update(userId, id, parsed.data)
  return address === null ? addressNotFound() : bookResponse(repo, userId, address)
}

export async function PATCH(request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params
  return handleJsonRoute(request, {
    route: '/api/account/addresses/[id]',
    limiter,
    handle: (body) => withRequestUser(request, (user) => patchAddress(createAddressRepository(), user.id, id, body)),
  })
}

export async function DELETE(request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params
  return handleJsonRoute(request, {
    route: '/api/account/addresses/[id]',
    limiter,
    allowEmptyBody: true,
    handle: () =>
      withRequestUser(request, async (user) => {
        const repo = createAddressRepository()
        return (await repo.remove(user.id, id)) ? bookResponse(repo, user.id) : addressNotFound()
      }),
  })
}
