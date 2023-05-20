import type { Plugin } from 'vite'
import { parse as parseVue } from '@vuedx/compiler-sfc'
import { removeExports as transformToJS } from 'unplugin-strip-exports'
import { init, parse as parseExports } from 'es-module-lexer'
import type { NuxtPage } from 'nuxt/schema'

async function generateCode(routes: NuxtPage[]) {
  return `
    ${routes.map((i, idx) => `import * as route${idx} from ${JSON.stringify(i.file)}`).join('\n')}
    
    export const router = {
      ${routes.map((i, idx) => `${JSON.stringify(i.name)}: route${idx}`).join(',\n')}
    }
  `
}

interface Options {
  routes: NuxtPage[]
}

export default function transform(options: Options): Plugin {
  const PREFIX = '\0virtual:'
  const virtualModuleId = '#numix/route-modules'

  let generatedCode: string

  return {
    name: 'numix-route-modules',
    async resolveId(id) {
      if (id === virtualModuleId) {
        if (!generatedCode)
          generatedCode = await generateCode(options.routes)

        return PREFIX + id
      }

      return null
    },
    load(id) {
      if (id.startsWith(PREFIX)) {
        const idNoPrefix = id.slice(PREFIX.length)

        if (idNoPrefix === virtualModuleId)
          return generatedCode
      }

      return null
    },
    async transform(code, id) {
      if (!id.endsWith('.vue'))
        return null

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
