import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

type Handler = (request: Request) => Promise<Response>
let dir: string
let register: Handler
let login: Handler
let logout: Handler
let me: Handler
let ip = 0

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'auth-routes-'))
  process.env.DATA_DIR = dir
  ;({ POST: register } = await import('./register/route'))
  ;({ POST: login } = await import('./login/route'))
  ;({ POST: logout } = await import('./logout/route'))
  ;({ GET: me } = await import('./me/route'))
})
afterAll(async () => {
  delete process.env.DATA_DIR
  await rm(dir, { recursive: true, force: true })
})

const headers = (extra: Record<string, string> = {}) => {
  ip += 1
  return { origin: 'http://shop.test', host: 'shop.test', 'content-type': 'application/json', 'x-forwarded-for': `10.1.0.${ip}`, ...extra }
}
const post = (path: string, body: unknown, extra?: Record<string, string>) =>
  new Request(`http://shop.test${path}`, { method: 'POST', headers: headers(extra), body: body === undefined ? undefined : JSON.stringify(body) })
const getMe = (cookie?: string) => me(new Request('http://shop.test/api/auth/me', { headers: cookie === undefined ? {} : { cookie } }))
const cookieOf = (res: Response) => res.headers.getSetCookie()[0] ?? ''
const tokenOf = (res: Response) => /ls_session=([^;]*)/.exec(cookieOf(res))?.[1] ?? ''

let n = 0
const account = () => {
  n += 1
  return { name: 'Lan Anh', email: `lan${n}@example.com`, password: 'mat-khau-123' }
}

describe('auth routes', () => {
  it('registers, sets an httpOnly Lax cookie and never returns the password hash', async () => {
    const input = account()
    const res = await register(post('/api/auth/register', input))
    expect(res.status).toBe(201)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(cookieOf(res)).toMatch(/^ls_session=[A-Za-z0-9_-]{43}; Path=\/; Expires=.+; HttpOnly; SameSite=Lax$/)
    const text = await res.text()
    expect(text).not.toMatch(/passwordHash|scrypt\$/)
    expect(JSON.parse(text).data.user).toMatchObject({ name: 'Lan Anh', email: input.email })
    const who = await getMe(`ls_session=${tokenOf(res)}`)
    expect(who.headers.get('cache-control')).toBe('no-store')
    expect((await who.json()).data.user.email).toBe(input.email)
  })

  it('rejects a duplicate email and invalid input', async () => {
    const input = account()
    await register(post('/api/auth/register', input))
    const dup = await register(post('/api/auth/register', { ...input, email: input.email.toUpperCase() }))
    expect(dup.status).toBe(409)
    expect((await dup.json()).error.fields).toEqual({ email: 'Email đã được sử dụng.' })
    const bad = await register(post('/api/auth/register', { ...input, password: 'short' }))
    expect(bad.status).toBe(400)
    expect((await bad.json()).error.fields).toHaveProperty('password')
    expect(cookieOf(bad)).toBe('')
  })

  it('gives one message for a wrong email and a wrong password', async () => {
    const input = account()
    await register(post('/api/auth/register', input))
    const wrongPass = await login(post('/api/auth/login', { email: input.email, password: 'sai-mat-khau' }))
    const wrongEmail = await login(post('/api/auth/login', { email: 'ghost@example.com', password: input.password }))
    for (const res of [wrongPass, wrongEmail]) {
      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng.' } })
      expect(cookieOf(res)).toBe('')
    }
    expect((await login(post('/api/auth/login', { email: 'x', password: '' }))).status).toBe(400)
  })

  it('logs in, then logout deletes the session record and clears the cookie', async () => {
    const input = account()
    await register(post('/api/auth/register', input))
    const res = await login(post('/api/auth/login', { email: ` ${input.email.toUpperCase()} `, password: input.password }))
    expect(res.status).toBe(200)
    expect(await res.clone().text()).not.toMatch(/passwordHash|scrypt\$/)
    expect((await res.json()).data.user.email).toBe(input.email)
    const cookie = `ls_session=${tokenOf(res)}`
    const out = await logout(post('/api/auth/logout', undefined, { cookie }))
    expect(out.status).toBe(200)
    expect(cookieOf(out)).toMatch(/^ls_session=; Path=\/; .*Max-Age=0; HttpOnly; SameSite=Lax/)
    expect((await (await getMe(cookie)).json()).data.user).toBeNull()
    const sessions = await readFile(join(dir, 'sessions.jsonl'), 'utf8')
    expect(sessions).toContain('"deleted":true')
  })

  it('logout without a session still clears the cookie; cross-origin is refused', async () => {
    expect((await logout(post('/api/auth/logout', {}))).status).toBe(200)
    expect((await logout(post('/api/auth/logout', {}, { origin: 'https://evil.com' }))).status).toBe(403)
  })

  it('rate limits login to 10 per minute per client', async () => {
    const same = { 'x-forwarded-for': '77.7.7.7' }
    for (let i = 0; i < 10; i++) await login(post('/api/auth/login', { email: 'a@b.vn', password: 'x' }, same))
    expect((await login(post('/api/auth/login', { email: 'a@b.vn', password: 'x' }, same))).status).toBe(429)
  })

  it('me reports null when signed out and hides storage errors', async () => {
    expect(await (await getMe()).json()).toEqual({ success: true, data: { user: null }, error: null })
    const blocker = join(dir, 'blocker')
    await writeFile(blocker, 'file')
    process.env.DATA_DIR = blocker
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const res = await getMe(`ls_session=${'a'.repeat(43)}`)
      expect(res.status).toBe(500)
      expect(spy).toHaveBeenCalledTimes(1)
    } finally {
      process.env.DATA_DIR = dir
      spy.mockRestore()
    }
  })
})
