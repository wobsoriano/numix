import { compileScript, parse } from '@vue/compiler-sfc'
import type { Plugin } from 'vite'

export function removeExports(): Plugin {
  return {
    name: 'numix-virtual-loaders',
    transform(code, id, opts) {
      if (opts?.ssr)
        return

      // TODO: Add another condition that checks file extension and path (i.e. pages/index.{vue|tsx|ts|js|jsx})
      if (id.includes('pages') && !id.match(/\.vue$/))
        return

      const { descriptor } = parse(code, {
        filename: id,
      })

      if (descriptor && descriptor.script) {
        const result = compileScript(descriptor, { id })

        const lang = result.attrs.lang
        const styles = descriptor.styles

        return {
          code: `
            <script setup lang="${lang}">
            ${descriptor.scriptSetup?.content}
            </script>

            <template>
            ${descriptor.template?.content}
            </template>

            ${styles.map(style => `<style lang="${style.lang || 'css'}" ${style.scoped ? 'scoped' : ''}>${style.content}</style>`).join('\n')}
          `,
        }
      }
    },
  }
}
