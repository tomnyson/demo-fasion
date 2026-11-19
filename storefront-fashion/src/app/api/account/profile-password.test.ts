import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { userFromToken } from '@/lib/auth/current-user'
import { verifyPassword } from '@/lib/auth/password'
import { createSessionStore } from '@/lib/auth/sessions'
import { createUserRepository } from '@/lib/auth/users'
import { jsonRequest, PASSWORD, signedInUser, tokenOf } from './test-helpers'

type Handler = (request: Request) => Promise<Response>
let dir: string
let patchProfile: Handler
let changePassword: Handler

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'account-routes-'))
  process.env.DATA_DIR = dir
  ;({ PATCH: patchProfile } = await import('./profile/route'))
  ;({ POST: changePassword } = await import('./password/route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

describe('PATCH /api/account/profile', () => {
  it('requires a session', async () => {
    const res = await patchProfile(jsonRequest('PATCH', '/api/account/profile', { name: 'Lan' }))
    expect(res.status).toBe(401)
    expect((await res.json()).error.code).toBe('UNAUTHORIZED')
  })

  it('updates name and phone, never returning the hash', async () => {
    const { cookie, userId } = await signedInUser()
    const res = await patchProfile(jsonRequest('PATCH', '/api/account/profile', { name: ' Lan Chi ', phone: '0912 345 678' }, { cookie }))
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const text = await res.text()
    expect(text).not.toMatch(/passwordHash|scrypt\$/)
    expect(JSON.parse(text).data.user).toMatchObject({ id: userId, name: 'Lan Chi', phone: '0912345678' })
  })

  it('clears the phone when it is sent empty', async () => {
    const { cookie, userId } = await signedInUser('0901234567')
    const res = await patchProfile(jsonRequest('PATCH', '/api/account/profile', { name: 'Lan Anh', phone: '' }, { cookie }))
    expect(res.status).toBe(200)
    expect((await res.json()).data.user).not.toHaveProperty('phone')
    expect((await createUserRepository().findById(userId))?.phone).toBeUndefined()
  })

  it('returns field errors for invalid input', async () => {
    const { cookie } = await signedInUser()
    const res = await patchProfile(jsonRequest('PATCH', '/api/account/profile', { name: 'A', phone: '12' }, { cookie }))
    expect(res.status).toBe(400)
    expect(Object.keys((await res.json()).error.fields)).toEqual(['name', 'phone'])
  })
})

describe('POST /api/account/password', () => {
  it('requires a session', async () => {
    expect((await changePassword(jsonRequest('POST', '/api/account/password', { currentPassword: 'x', newPassword: '12345678' }))).status).toBe(401)
  })

  it('rejects a wrong current password on the currentPassword field', async () => {
    const { cookie } = await signedInUser()
    const res = await changePassword(jsonRequest('POST', '/api/account/password', { currentPassword: 'sai-mat-khau', newPassword: 'mat-khau-moi-1' }, { cookie }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.fields).toEqual({ currentPassword: 'Mật khẩu hiện tại không đúng.' })
    expect(res.headers.getSetCookie()).toEqual([])
  })

  it('validates the new password length', async () => {
    const { cookie } = await signedInUser()
    const res = await changePassword(jsonRequest('POST', '/api/account/password', { currentPassword: PASSWORD, newPassword: 'short' }, { cookie }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.fields).toHaveProperty('newPassword')
  })

  it('changes the password, signs out every old session and keeps this device signed in', async () => {
    const { cookie, userId, email } = await signedInUser()
    const otherDevice = (await createSessionStore().create(userId, new Date())).token
    const someoneElse = await signedInUser()
    const res = await changePassword(jsonRequest('POST', '/api/account/password', { currentPassword: PASSWORD, newPassword: 'mat-khau-moi-1' }, { cookie }))
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(res.headers.getSetCookie()[0]).toMatch(/HttpOnly; SameSite=Lax/)
    expect(await res.clone().text()).not.toMatch(/passwordHash|scrypt\$/)
    expect((await res.json()).data.user.email).toBe(email)
    expect(await userFromToken(cookie.slice('ls_session='.length))).toBeNull()
    expect((await userFromToken(tokenOf(res)))?.id).toBe(userId)
    expect(await userFromToken(otherDevice)).toBeNull()
    expect((await userFromToken(someoneElse.cookie.slice('ls_session='.length)))?.id).toBe(someoneElse.userId)
    const stored = await createUserRepository().findById(userId)
    expect(await verifyPassword('mat-khau-moi-1', stored!.passwordHash)).toBe(true)
  })
})
