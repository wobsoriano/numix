import { fileURLToPath } from 'node:url'
import { addComponent, addImportsDir, addServerHandler, addTypeTemplate, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
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
    version: '^3.16.0',
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.build.transpile.push(resolver.resolve('./runtime'));

    // Add virtual server handler
    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./runtime/templates/handler.mjs'),
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
    addImportsDir(resolver.resolve('./runtime/composables'));
    addComponent({
      filePath: resolver.resolve('./runtime/components/Form'),
      name: 'Form',
    })

    // Generate global auto-import types
    addTypeTemplate({
      filename: 'types/numix.d.ts',
      getContents: () => {
        return `
        export {}
        declare global {
          type LoaderEvent = import(${JSON.stringify(resolver.resolve('./runtime/types'))}).LoaderEvent
          type ActionEvent  = import(${JSON.stringify(resolver.resolve('./runtime/types'))}).ActionEvent
        }
        `
      },
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
