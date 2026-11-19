import { describe, expect, it } from 'vitest'
import { withLock } from './lock'

const tick = () => new Promise((resolve) => setTimeout(resolve, 1))

describe('withLock', () => {
  it('runs tasks with the same key one after another', async () => {
    let counter = 0
    const bump = async () => {
      const seen = counter
      await tick()
      counter = seen + 1
    }
    await Promise.all(Array.from({ length: 20 }, () => withLock('k', bump)))
    expect(counter).toBe(20)
  })

  it('keeps going after a task fails and passes results through', async () => {
    await expect(withLock('e', async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
    await expect(withLock('e', async () => 7)).resolves.toBe(7)
  })
})
