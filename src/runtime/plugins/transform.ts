import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'
import { init, parse as parseExports } from 'es-module-lexer'

interface Options {
  pagesDir: string
}

export function removeExports(options: Options): Plugin {
  return {
    name: 'vite-plugin-numix-transform',
    async transform(code, id, opts) {
      // If it's SSR code, let's bypass it.
      if (opts?.ssr)
        return

      // If it's .server.<ext>, let's bypass it.
      if (id.includes('.server.')) {
        const result = await transformExports(code)
        return result
      }

      // Bypass if not inside the pages folder and not a vue file
      // TODO: Add support for jsx/tsx/js/ts
      if (!id.includes(options.pagesDir) || !id.match(/\.vue$/))
        return

      const { descriptor } = parse(code, {
        filename: id,
      })

      if (descriptor && descriptor.script) {
        const s = new MagicString(code)

        s.remove(descriptor.script.loc.start.offset, descriptor.script.loc.end.offset)

        return {
          code: s.toString(),
        }
      }
    },
  }
}

async function transformExports(src: string) {
  await init
  const [, exports] = parseExports(src)
  return exports.map(e => `export const ${e.n} = {}`).join('\n')
}
