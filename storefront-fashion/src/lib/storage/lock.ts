const queues = new Map<string, Promise<unknown>>()

/**
 * Runs `task` after every earlier task with the same key has settled, so check-then-write
 * sequences on one data file cannot interleave. In-process only: one Node server per data dir.
 */
export function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve()
  const run = previous.then(task, task)
  const settled = run.then(
    () => undefined,
    () => undefined,
  )
  queues.set(key, settled)
  void settled.then(() => {
    if (queues.get(key) === settled) queues.delete(key)
  })
  return run
}
