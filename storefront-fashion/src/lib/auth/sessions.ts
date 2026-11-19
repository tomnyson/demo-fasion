import { createHash, randomBytes } from 'node:crypto'
import { createCollection, type Tombstone } from '@/lib/storage/collection'
import { dataPath } from '@/lib/storage/jsonl-store'

/** Server-side session record. `id` is sha256(token); the raw token only ever lives in the cookie. */
interface SessionRecord {
  readonly id: string
  readonly userId: string
  readonly createdAt: string
  readonly expiresAt: string
}

export interface IssuedSession {
  readonly token: string
  readonly expiresAt: Date
}

export interface SessionStore {
  create(userId: string, now: Date): Promise<IssuedSession>
  resolve(token: string, now: Date): Promise<string | null>
  destroy(token: string): Promise<void>
  destroyAllFor(userId: string): Promise<void>
}

export const SESSIONS_FILE = 'sessions.jsonl'
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
const TOKEN_BYTES = 32
/** Base64url of 32 bytes is 43 characters; anything longer is not one of ours. */
const MAX_TOKEN_LENGTH = 64

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex')

/** Past this many lines, creating a session rewrites the file with only the live sessions. */
export const COMPACT_AFTER_LINES = 500

export interface SessionStoreOptions {
  readonly compactAfterLines?: number
}

export function createSessionStore(filePath: string = dataPath(SESSIONS_FILE), { compactAfterLines = COMPACT_AFTER_LINES }: SessionStoreOptions = {}): SessionStore {
  const sessions = createCollection<SessionRecord>(filePath)
  return {
    async create(userId, now) {
      const token = randomBytes(TOKEN_BYTES).toString('base64url')
      const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
      await sessions.put({ id: hashToken(token), userId, createdAt: now.toISOString(), expiresAt: expiresAt.toISOString() })
      // Drops expired sessions, destroyed ones (tombstones) and superseded lines so the file stays bounded.
      // The session is already stored, so a failed compaction is logged rather than failing sign-in.
      await sessions
        .compact({ maxLines: compactAfterLines, keep: (session) => Date.parse(session.expiresAt) > now.getTime() })
        .catch((error: unknown) => console.error('[sessions] compaction failed', { error }))
      return { token, expiresAt }
    },
    async resolve(token, now) {
      if (token === '' || token.length > MAX_TOKEN_LENGTH) return null
      const session = await sessions.get(hashToken(token))
      if (session === null || Date.parse(session.expiresAt) <= now.getTime()) return null
      return session.userId
    },
    destroy: (token) => sessions.remove(hashToken(token)),
    destroyAllFor: (userId) =>
      sessions.mutate((all) => ({
        writes: all.filter((session) => session.userId === userId).map((session): Tombstone => ({ id: session.id, deleted: true })),
        result: undefined,
      })),
  }
}
