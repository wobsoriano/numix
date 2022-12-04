import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { addServerHandler, addTemplate, addVitePlugin, defineNuxtModule, useLogger } from '@nuxt/kit'
import { resolve } from 'pathe'
import StripExports from 'unplugin-strip-exports/vite'
import escapeRE from 'escape-string-regexp'
import fg from 'fast-glob'
import { parse } from '@vuedx/compiler-sfc'
import transformServerExtension from './runtime/transformers/server-extension'
import transformVueSFC from './runtime/transformers/rollup-vue-import'

const logger = useLogger('numix')
const isNonEmptyDir = (dir: string) => fs.existsSync(dir) && fs.readdirSync(dir).length
function isVuePage(dirs_: Record<string, string>, path: string) {
  const dirs = [
    dirs_.pages,
    dirs_.layouts,
    dirs_.middleware,
  ].filter(Boolean)

  const pathPattern = new RegExp(`(^|\\/)(${dirs.map(escapeRE).join('|')})/`)

  return path.match(pathPattern) && path.match(/\.vue$/)
}

export default defineNuxtModule({
  meta: {
    name: 'numix',
    configKey: 'numix',
  },
  async setup(_options, nuxt) {
    const files: string[] = []

    const pagesDirs = nuxt.options._layers.map(
      layer => resolve(layer.config.srcDir, layer.config.dir?.pages || 'pages'),
    )

    if (!pagesDirs.some(dir => isNonEmptyDir(dir))) {
      logger.warn('[numix]: Pages not enabled. Skipping module setup.')
      return
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // Add virtual server handler
    addServerHandler({
      middleware: true,
      handler: resolve(nuxt.options.buildDir, 'numix-handler.mjs'),
    })

    await scanSFCFiles()

    addTemplate({
      filename: 'numix-handler.mjs',
      src: resolve(runtimeDir, 'templates/handler.mjs'),
      write: true,
      options: {
        files,
      },
    })

    // Add virtual loader/action modules for each page
    nuxt.hook('nitro:config', (config) => {
      config.rollupConfig = config.rollupConfig || {}
      config.rollupConfig.plugins = config.rollupConfig.plugins || []
      config.rollupConfig.plugins.push(transformVueSFC())
    })

    // Add strip function vite plugin
    addVitePlugin(transformServerExtension())
    addVitePlugin(StripExports({
      match(filepath, ssr) {
        // Ignore SSR build
        if (ssr)
          return

        // Remove loader and action exports
        if (isVuePage(nuxt.options.dir, filepath))
          return ['loader', 'action']
      },
    }))

    // Add auto-import composables
    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    // Add auto-import components
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'components'))
    })

    // Generate global auto-import types
    addTemplate({
      filename: 'types/numix.d.ts',
      getContents: () => {
        return `
        export {}
        declare global {
          type LoaderFunction = import('numix/types').LoaderFunction
          type ActionFunction  = import('numix/types').ActionFunction
        }
        `
      },
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/numix.d.ts') })
    })

    // Regenerate loaders/actions when adding or removing pages
    nuxt.hook('builder:watch', async (_, path) => {
      if (isVuePage(nuxt.options.dir, path))
        await nuxt.callHook('builder:generateApp')
    })

    async function scanSFCFiles() {
      files.length = 0
      const foundFiles = (await fg('**/*.vue', {
        cwd: resolve(nuxt.options.srcDir, nuxt.options.dir.pages),
        absolute: true,
        onlyFiles: true,
      })).filter((file) => {
        const code = fs.readFileSync(file, 'utf-8')
        const { descriptor } = parse(code)
        return descriptor && descriptor.script
      })

      files.push(...new Set(foundFiles))
      return files
    }
  },
})
