import { compileScript, parse } from '@vue/compiler-sfc'
import type { Plugin } from 'vite'
import { stripFunction } from '../utils'

export function removeExports(): Plugin {
  return {
    name: 'numix-virtual-loaders',
    transform(code, id, opts) {
      if (opts?.ssr)
        return

      // TODO: Add another condition that checks file extension and path (i.e. pages/index.{vue|tsx|ts|js|jsx})

      const { descriptor } = parse(code)

      if (descriptor && descriptor.script) {
        const result = compileScript(descriptor, { id })
        const lang = result.attrs.lang
        return {
          code: `
            <script lang="${lang}">
            ${stripFunction(descriptor.script.content, 'loader')}
            </script>

            <script setup lang="${lang}">
            ${descriptor.scriptSetup?.content}
            </script>

            <template>
            ${descriptor.template?.content}
            </template>
          `,
        }
      }
    },
  }
}
