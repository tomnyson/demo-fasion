import { randomFillSync } from 'node:crypto'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
const SUFFIX_LENGTH = 8
/** Largest multiple of the alphabet size that fits in a byte; bytes at or above it would bias the modulo. */
const UNBIASED_LIMIT = 256 - (256 % ALPHABET.length)
const MAX_DRAWS = 64

export const ORDER_CODE_PATTERN = /^LS-\d{6}-[A-Z2-9]{8}$/

const secureRandom = (n: number): Uint8Array => randomFillSync(new Uint8Array(n))

function datePart(now: Date): string {
  const yy = String(now.getUTCFullYear() % 100).padStart(2, '0')
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

function randomSuffix(random: (n: number) => Uint8Array): string {
  let suffix = ''
  for (let draw = 0; draw < MAX_DRAWS && suffix.length < SUFFIX_LENGTH; draw++) {
    for (const byte of random(SUFFIX_LENGTH - suffix.length)) {
      if (byte < UNBIASED_LIMIT) suffix += ALPHABET[byte % ALPHABET.length]
    }
  }
  if (suffix.length < SUFFIX_LENGTH) throw new Error('Random source did not yield usable bytes')
  return suffix
}

export function generateOrderCode(now: Date, random: (n: number) => Uint8Array = secureRandom): string {
  return `LS-${datePart(now)}-${randomSuffix(random)}`
}
