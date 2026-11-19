import { hashPassword, verifyPassword } from './password'
import type { User, UserRepository } from './users'

export const INVALID_CREDENTIALS = 'Email hoặc mật khẩu không đúng.'

let dummyHash: Promise<string> | null = null
/** A real hash to verify against when the email is unknown, so both failures cost the same time. */
const getDummyHash = (): Promise<string> => (dummyHash ??= hashPassword('khong-phai-mat-khau-that'))

/** Returns the user when email and password match, otherwise null (never says which part was wrong). */
export async function checkCredentials(users: UserRepository, email: string, password: string): Promise<User | null> {
  const user = await users.findByEmail(email)
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()))
  return user !== null && valid ? user : null
}
