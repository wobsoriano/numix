import type { Plugin } from 'vite'
import fg from 'fast-glob'
import { parse as parseVue } from '@vuedx/compiler-sfc'
import { removeExports as transformToJS } from 'unplugin-strip-exports'
import { init, parse as parseExports } from 'es-module-lexer'

async function scanSFCFiles(cwd: string) {
  const files = await fg('**/*.vue', {
    cwd,
    absolute: true,
    onlyFiles: true,
  })
  return files
}

interface Options {
  cwd: string
}

export default function transform(options: Options): Plugin {
  const PREFIX = '\0virtual:'
  const virtualModuleId = 'route-modules.mjs'

  return {
    name: 'numix-route-modules',
    resolveId(id) {
      if (id === virtualModuleId)
        return PREFIX + id

      return null
    },
    async load(id) {
      if (id.startsWith(PREFIX)) {
        const idNoPrefix = id.slice(PREFIX.length)

        if (idNoPrefix === virtualModuleId) {
          const pageFiles = await scanSFCFiles(options.cwd)

          return `
            ${pageFiles.map((i, idx) => `import * as route${idx} from ${JSON.stringify(i)}`).join('\n')}
            
            const router = {
              ${pageFiles.map((name, idx) => `"${name.replace(options.cwd, '')}": route${idx}`).join('\n,')}
            }

            export {
              router
            }
          `
        }
      }

      return null
    },
    async transform(code, id) {
      if (!id.endsWith('.vue'))
        return

      await init

      const { descriptor } = parseVue(code)

      if (descriptor && descriptor.script) {
        let { code: result } = transformToJS(descriptor.script.content, [])
        const [, exports] = parseExports(result)
        const hasLoader = exports.find(i => i.n === 'loader')
        const hasAction = exports.find(i => i.n === 'action')

        if (!hasLoader)
          result = `${result}\nexport const loader = false`

        if (!hasAction)
          result = `${result}\nexport const action = false`

        return {
          code: result,
          map: null,
        }
      }

      return {
        code: 'export default {}',
        map: null,
      }
    },
  }
}
