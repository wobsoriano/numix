import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { addServerHandler, addTemplate, addVitePlugin, defineNuxtModule, useLogger } from '@nuxt/kit'
import { parse } from '@vue/compiler-sfc'
import virtual from '@rollup/plugin-virtual'
import { resolve } from 'pathe'
import StripExports from 'unplugin-strip-exports/vite'
import { removeExports } from 'unplugin-strip-exports'
import transformServerExtension from './runtime/transformers/server-extension'

const logger = useLogger('numix')

export default defineNuxtModule({
  meta: {
    name: 'numix',
    configKey: 'numix',
  },
  setup(_options, nuxt) {
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.build.transpile.push(runtimeDir)

    const virtuals: Record<string, string> = {}

    nuxt.hook('pages:extend', (pages) => {
      if (!pages.length) {
        logger.warn('[numix]: <NuxtPage /> not found. Skipping module setup.')
        return
      }

      const pageMap: Record<string, any> = {}
      for (const page of pages) {
        const content = fs.readFileSync(page.file, 'utf-8')
        const { descriptor } = parse(content)
        if (descriptor && descriptor.script) {
          const importName = `virtual:numix:page:${page.name as string}`
          virtuals[importName] = removeExports(descriptor.script.content, [])
          pageMap[page.name as string] = {
            ...page,
            importName,
          }
        }
      }

      const serverHandlerContent = `
        import { createError, eventHandler, getQuery, isMethod } from 'h3';

        async function getLoaderByRouteId (id) {
          ${Object.values(pageMap).map(page => `if (id === '${page.name}') { return import('${page.importName}') }`).join('\n')}
        }

        export default eventHandler(async (event) => {
          const query = getQuery(event);
          const isGet = isMethod(event, 'GET');

          if (query._data) {
            const { loader, action } = await getLoaderByRouteId(query._data);

            if (!loader && !action) {
              throw createError({
                statusCode: 404,
                statusMessage: 'No loader/action function defined.'
              })
            }

            if (!isGet && action) {
              return action({
                node: event.node,
                path: event.path,
                context: event.context,
                params: JSON.parse(query._params),
              })
            }

            return loader({
              node: event.node,
              path: event.path,
              context: event.context,
              params: JSON.parse(query._params),
            })
          }
        })
      `

      fs.writeFileSync(resolve(nuxt.options.buildDir, 'numix-handler.mjs'), serverHandlerContent)
    })

    // Add virtual server handler
    addServerHandler({
      middleware: true,
      handler: resolve(nuxt.options.buildDir, 'numix-handler.mjs'),
    })

    // Add virtual loader/action modules for each page
    nuxt.hook('nitro:config', (config) => {
      config.rollupConfig = config.rollupConfig || {}
      config.rollupConfig.plugins = config.rollupConfig.plugins || []
      config.rollupConfig.plugins.push(virtual(virtuals))
    })

    // Add strip function vite plugin
    addVitePlugin(transformServerExtension())
    addVitePlugin(StripExports({
      match(filepath, ssr) {
        // Ignore SSR build
        if (ssr)
          return

        // Remove loader and action exports
        if (filepath.includes(nuxt.options.dir.pages) && filepath.includes('.vue'))
          return ['loader', 'action']
      },
      beforeOutput(code) {
        return code.replace('loader,', '').replace('action,', '')
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

    // Watch page vue components
    nuxt.hook('builder:watch', async (e, path) => {
      if (!path.includes(nuxt.options.dir.pages) || !path.match(/\.vue$/))
        return
      await nuxt.callHook('builder:generateApp')
    })
  },
})
