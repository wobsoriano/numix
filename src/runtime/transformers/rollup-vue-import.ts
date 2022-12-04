import { parse as parseVue } from '@vuedx/compiler-sfc'
import { removeExports as transformToJS } from 'unplugin-strip-exports'
import { init, parse as parseExports } from 'es-module-lexer'

/**
 * This plugin removes unnecessary code
 * from imported Vue SFC. We only need
 * the loader and action function.
 */
export default function transform(): any {
  return {
    name: 'numix:transform:vue:sfc',
    async transform(code: any, id: any) {
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
    },
  }
}
