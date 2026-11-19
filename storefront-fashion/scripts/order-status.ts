// Staff command (A5): pnpm order:status <CODE> <pending|confirmed|shipping|delivered|cancelled>
// Uses the same repository as the app. updateStatus -> collection.mutate -> withFileLock, which takes
// the cross-process `orders.jsonl.lock`, so this run cannot interleave with an in-app cancel.
// DATA_DIR selects the data folder (default .data).
import { createFileOrderRepository } from '@/lib/orders/repository'
import { runOrderStatus } from '@/lib/orders/status-cli'

const exitCode = await runOrderStatus(process.argv.slice(2), {
  repo: createFileOrderRepository(),
  now: () => new Date(),
  out: (line) => process.stdout.write(`${line}\n`),
  err: (line) => process.stderr.write(`${line}\n`),
})
process.exitCode = exitCode
