import * as fs from 'fs'
import { addImports, addImportsDir, addServerHandler, addTemplate, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { compileScript, parse } from '@vue/compiler-sfc'
import type { Loader } from 'esbuild'
import virtual from '@rollup/plugin-virtual'
import { transform } from './runtime/utils/server'
import { resolve } from 'pathe'
import { removeExports } from './runtime/plugins'

export type {
  LoaderFunction,
  ActionFunction,
} from './runtime/types'

export default defineNuxtModule({
  meta: {
    name: 'numix',
    configKey: 'numix',
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.build.transpile.push(resolver.resolve('runtime'))

    const virtuals: Record<string, string> = {}

    nuxt.hook('pages:extend', (pages) => {
      const pageMap: Record<string, any> = {}
      for (const page of pages) {
        const content = fs.readFileSync(page.file, 'utf-8')
        const { descriptor } = parse(content)
        if (descriptor && descriptor.script) {
          const code = compileScript(descriptor, { id: page.file })
          const importName = `virtual:numix:page:${page.name as string}`
          virtuals[importName] = transform(descriptor.script.content, {
            loader: code.lang as Loader,
            minify: true,
          })
          pageMap[page.name as string] = {
            ...page,
            importName,
          }
        }
      }

      virtuals['virtual:numix:event:handler'] = `
        import { eventHandler, getQuery, isMethod } from 'h3';

        async function getLoaderByRouteId (id) {
          ${Object.values(pageMap).map(page => `if (id === '${page.name}') { return import('${page.importName}') }`).join('\n')}
        }
        
        const pageMap = ${JSON.stringify(pageMap)};

        export default eventHandler(async (event) => {
          const query = getQuery(event);
          const isGet = isMethod(event, 'GET');

          if (query._data) {
            const { loader, action } = await getLoaderByRouteId(query._data);

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
    })

    // Add virtual server handler
    addServerHandler({
      middleware: true,
      handler: 'virtual:numix:event:handler',
    })

    // Add virtual loader/action modules for each page
    nuxt.hook('nitro:config', (config) => {
      config.rollupConfig = config.rollupConfig || {}
      config.rollupConfig.plugins = config.rollupConfig.plugins || []
      config.rollupConfig.plugins.push(virtual(virtuals))
    })

    // Add strip function vite plugin
    addVitePlugin(removeExports({
      pagesDir: nuxt.options.dir.pages,
    }))

    // Add auto-imports
    addImports([
      { name: 'useActionData', from: resolver.resolve('runtime/client') },
      { name: 'useLoaderData', from: resolver.resolve('runtime/client') },
      { name: 'Form', from: resolver.resolve('runtime/client') },
      { name: 'getCacheKey', from: resolver.resolve('runtime/client') },
    ])

    // Generate global auto-import types
    addTemplate({
      filename: 'types/numix.d.ts',
      getContents: () => {
        return `
        export {}
        declare global {
          type LoaderFunction = import('numix').LoaderFunction
          type ActionFunction  = import('numix').ActionFunction
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
