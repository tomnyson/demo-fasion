import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname)
const SELF = resolve(__filename)
const HEX_ALLOWED = new Set([join(SRC, 'app', 'globals.css'), join(SRC, 'app', 'icon.svg')])
const MAX_LINES = 400

const banned = [/vertex/i, /enzo/i, /bigsizemol/i, /báo giá/i, /đồng phục/i, /#00A0E3/i, /#061B3B/i, /#F54C42/i]
const hexLiteral = /#[0-9a-f]{3,8}\b/i
const skippedTests = /test\.fixme|it\.skip|describe\.skip/

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk(SRC).filter((f) => f !== SELF)
if (files.length === 0) throw new Error('hygiene test found no files under src')
const read = (f: string) => readFileSync(f, 'utf8')
const rel = (f: string) => relative(SRC, f)

describe('project hygiene', () => {
  it('has no leftovers from the old shop', () => {
    const offenders = files.flatMap((f) => banned.filter((p) => p.test(read(f))).map((p) => `${rel(f)}: ${p}`))
    expect(offenders).toEqual([])
  })

  it('keeps hex colours in globals.css and icon.svg only', () => {
    const scoped = files.filter(
      (f) =>
        f.endsWith('.tsx') &&
        !HEX_ALLOWED.has(f) &&
        (f.startsWith(join(SRC, 'components')) || f.startsWith(join(SRC, 'app'))),
    )
    const hexOffenders = scoped.filter((f) => hexLiteral.test(read(f))).map(rel)
    expect(hexOffenders).toEqual([])
  })

  it('has no source file longer than 400 lines', () => {
    const longFiles = files.filter((f) => read(f).split('\n').length > MAX_LINES).map(rel)
    expect(longFiles).toEqual([])
  })

  it('has no skipped or fixme tests', () => {
    const skipped = files.filter((f) => skippedTests.test(read(f))).map(rel)
    expect(skipped).toEqual([])
  })
})
