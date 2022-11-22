import { compileScript, parse } from '@vue/compiler-sfc'
import type { Loader } from 'esbuild'
import type { Plugin } from 'vite'
import { stripFunction } from '../utils/server'

interface Options {
  pagesDir: string
}

export function removeExports(options: Options): Plugin {
  return {
    name: 'vite-plugin-numix-transform',
    transform(code, id, opts) {
      // If it's SSR code, let's bypass it.
      if (opts?.ssr)
        return

      // If it's .server.<ext>, let's bypass it.
      if (id.includes('.server.'))
        return 'export default {}'

      // Bypass if not inside the pages folder and not a vue file
      // TODO: Add support for jsx
      if (!id.includes(options.pagesDir) || !id.match(/\.vue$/))
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
            <script lang="${lang}">
            ${stripFunction(descriptor.script.content, ['loader', 'action'], { loader: lang as Loader })}
            </script>

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
