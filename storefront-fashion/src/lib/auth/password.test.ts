import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('hashes in the scrypt$N$r$p$salt$hash format and verifies the right password only', async () => {
    const stored = await hashPassword('mat-khau-dai')
    const parts = stored.split('$')
    expect(parts.slice(0, 4)).toEqual(['scrypt', '16384', '8', '1'])
    expect(Buffer.from(parts[4], 'base64url')).toHaveLength(16)
    expect(Buffer.from(parts[5], 'base64url')).toHaveLength(64)
    expect(await verifyPassword('mat-khau-dai', stored)).toBe(true)
    expect(await verifyPassword('mat-khau-sai', stored)).toBe(false)
  })

  it('salts every hash', async () => {
    expect(await hashPassword('same-password')).not.toBe(await hashPassword('same-password'))
  })

  it.each([
    ['empty', ''],
    ['wrong scheme', 'bcrypt$16384$8$1$c2FsdA$aGFzaA'],
    ['too few parts', 'scrypt$16384$8$1$c2FsdA'],
    ['non-numeric cost', 'scrypt$abc$8$1$c2FsdA$aGFzaA'],
    ['cost not a power of two', 'scrypt$1000$8$1$c2FsdA$aGFzaA'],
    ['oversized cost', 'scrypt$1048576$8$1$c2FsdA$aGFzaA'],
    ['empty hash', 'scrypt$16384$8$1$c2FsdA$'],
    ['parameters scrypt refuses', 'scrypt$65536$16$4$c2FsdA$aGFzaA'],
  ])('returns false for a malformed stored value (%s)', async (_name, stored) => {
    expect(await verifyPassword('anything', stored)).toBe(false)
  })
})
