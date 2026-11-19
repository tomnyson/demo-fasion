import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

const SCHEME = 'scrypt'
const COST = 16_384
const BLOCK_SIZE = 8
const PARALLELISM = 1
const SALT_BYTES = 16
const KEY_BYTES = 64
/** Upper bounds when reading stored hashes, so a tampered record cannot make verification expensive. */
const MAX_COST = 65_536
const MAX_BLOCK_SIZE = 16
const MAX_PARALLELISM = 4
const MAX_KEY_BYTES = 128

interface ScryptParams {
  readonly cost: number
  readonly blockSize: number
  readonly parallelism: number
  readonly salt: Buffer
  readonly hash: Buffer
}

function derive(password: string, salt: Buffer, keyBytes: number, params: Omit<ScryptParams, 'salt' | 'hash'>): Promise<Buffer> {
  const options: ScryptOptions = {
    N: params.cost,
    r: params.blockSize,
    p: params.parallelism,
    // scrypt needs about 128·N·r bytes per lane; leave headroom so valid parameters never hit the limit.
    maxmem: 128 * params.cost * params.blockSize * (params.parallelism + 2),
  }
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, keyBytes, options, (error, key) => (error ? reject(error) : resolve(key)))
  })
}

/** Returns `scrypt$N$r$p$salt$hash` with base64url salt and hash. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES)
  const params = { cost: COST, blockSize: BLOCK_SIZE, parallelism: PARALLELISM }
  const hash = await derive(password, salt, KEY_BYTES, params)
  return [SCHEME, COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64url'), hash.toString('base64url')].join('$')
}

const boundedInt = (raw: string, max: number): number | null => {
  if (!/^\d{1,7}$/.test(raw)) return null
  const value = Number(raw)
  return value >= 1 && value <= max ? value : null
}

function parseStored(stored: string): ScryptParams | null {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== SCHEME) return null
  const cost = boundedInt(parts[1], MAX_COST)
  const blockSize = boundedInt(parts[2], MAX_BLOCK_SIZE)
  const parallelism = boundedInt(parts[3], MAX_PARALLELISM)
  const salt = Buffer.from(parts[4], 'base64url')
  const hash = Buffer.from(parts[5], 'base64url')
  if (cost === null || blockSize === null || parallelism === null) return null
  if ((cost & (cost - 1)) !== 0 || cost < 2) return null
  if (salt.length === 0 || hash.length === 0 || hash.length > MAX_KEY_BYTES) return null
  return { cost, blockSize, parallelism, salt, hash }
}

/** Constant-time check of `password` against a stored hash; malformed stored values are simply `false`. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const params = parseStored(stored)
  if (params === null) return false
  const candidate = await derive(password, params.salt, params.hash.length, params)
  return candidate.length === params.hash.length && timingSafeEqual(candidate, params.hash)
}
