import type { Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'

/**
 * Informs Numix that this code should never end up in the browser.
 * This is optional as unplugin-strip-exports does a good job of ensuring server code
 * doesn't end up in the client.
 */
export default function transform(): Plugin {
  return {
    name: 'numix:fake:exports',
    enforce: 'post',
    async transform(code, id, opts) {
      // If it's SSR code, let's bypass it.
      if (opts?.ssr)
        return

      // If it's .server.<ext>, let's fake the exports.
      if (id.includes('.server.')) {
        await init

        const [, exports] = parse(code)
        const fakeCode = exports.map((item) => {
          if (item.n === 'default')
            return 'export default {}'
          return `export const ${item.n} = {}`
        }).join('\n')

        return {
          code: fakeCode,
        }
      }
    },
  }
}
