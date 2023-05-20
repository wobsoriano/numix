import { fileURLToPath } from 'node:url'
import { addServerHandler, addTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { resolve } from 'pathe'
import StripExports from 'unplugin-strip-exports/vite'
import escapeRE from 'escape-string-regexp'
import emptyExportsPlugin from './runtime/transformers/empty-exports'
import routeModulesPlugin from './runtime/transformers/route-modules'
import { resolvePagesRoutes } from './runtime/utils'

export default defineNuxtModule({
  meta: {
    name: 'numix',
    configKey: 'numix',
    version: '^3.5.0',
  },
  async setup(_options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // Add virtual server handler
    addServerHandler({
      middleware: true,
      handler: resolve(runtimeDir, 'templates/handler.mjs'),
    })

    const routes = await resolvePagesRoutes()

    nuxt.hook('nitro:config', (config) => {
      config.rollupConfig = config.rollupConfig || {}
      config.rollupConfig.plugins = config.rollupConfig.plugins || []
      if (Array.isArray(config.rollupConfig.plugins))
        config.rollupConfig.plugins.push(routeModulesPlugin({ routes }))
    })

    // Add strip function vite plugin
    addVitePlugin(emptyExportsPlugin())
    addVitePlugin(StripExports({
      match(filepath) {
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
          type LoaderFunction = import(${JSON.stringify(resolve(runtimeDir, 'types'))}).LoaderFunction
          type ActionFunction  = import(${JSON.stringify(resolve(runtimeDir, 'types'))}).ActionFunction
        }
        `
      },
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/numix.d.ts') })
    })
  },
})

function isVuePage(dirs_: Record<string, string>, path: string) {
  const dirs = [
    dirs_.pages,
    dirs_.layouts,
    dirs_.middleware,
  ].filter(Boolean)

  const pathPattern = new RegExp(`(^|\\/)(${dirs.map(escapeRE).join('|')})/`)

  return path.match(pathPattern) && path.match(/\.vue$/)
}
