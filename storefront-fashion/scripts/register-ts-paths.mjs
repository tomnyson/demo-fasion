// Lets plain `node` run the TypeScript sources the app shares with scripts: maps the `@/` alias to
// `src/` and resolves extensionless relative imports to `.ts` files. No dependencies.
import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { fileURLToPath } from 'node:url'

const SRC = new URL('../src/', import.meta.url)
const EXTENSIONS = ['.ts', '.tsx', '/index.ts']
const HAS_EXTENSION = /\.[cm]?[jt]sx?$|\.json$/

function withTsExtension(url) {
  if (HAS_EXTENSION.test(url.pathname)) return url.href
  const match = EXTENSIONS.map((ext) => new URL(`${url.href}${ext}`)).find((candidate) => existsSync(fileURLToPath(candidate)))
  return match === undefined ? url.href : match.href
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) return nextResolve(withTsExtension(new URL(specifier.slice(2), SRC)), context)
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
      return nextResolve(withTsExtension(new URL(specifier, context.parentURL)), context)
    }
    return nextResolve(specifier, context)
  },
})
