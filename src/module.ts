import * as fs from 'fs'
import { addServerHandler, createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'
import { join } from 'pathe'
import { parse } from '@vue/compiler-sfc'
import dedent from 'dedent'
import { stripFunction } from './runtime/utils/strip-function'

export default defineNuxtModule({
  meta: {
    name: 'numix',
    configKey: 'numix',
  },
  setup(options, nuxt) {
    const buildResolver = createResolver(nuxt.options.buildDir)
    const routesPath = buildResolver.resolve('loader')

    nuxt.options.build.transpile.push('#build/loader/handler.mjs', routesPath)

    nuxt.hook('pages:extend', (pages) => {
      if (!fs.existsSync(routesPath))
        fs.mkdirSync(routesPath)

      const resolvedPages = []
      for (const page of pages) {
        const content = fs.readFileSync(page.file, 'utf-8')
        const { descriptor } = parse(content)
        if (descriptor && descriptor.script) {
          resolvedPages.push({
            ...page,
            loader: stripFunction(descriptor.script.content, 'loader'),
            action: stripFunction(descriptor.script.content, 'action'),
          })
        }
      }

      fs.writeFileSync(join(routesPath, 'routes.json'), JSON.stringify(resolvedPages, null, 2))

      fs.writeFileSync(join(routesPath, 'handler.mjs'), dedent`
        import { eventHandler, getQuery, getRouterParams } from 'h3'

        export async function handlerDynamicImport (lang) {
          ${pages.map(page => `if (lang === '${page.name}') { return import('virtual:handler:${page.name}') }`).join('\n')}
        }

        export default eventHandler(async (event) => {
          const query = getQuery(event)
          if (query._data) {
            const { loader } = await handlerDynamicImport(query._data)
            return loader({
              node: event.node,
              context: event.context,
              path: event.path,
              params: getRouterParams(event)
            })
          }
        })
      `)
    })

    nuxt.hook('builder:watch', async (e, path) => {
      // TODO: Check path and file extension
      await nuxt.callHook('builder:generateApp')
    })

    nuxt.hook('nitro:config', () => {
      addServerHandler({
        middleware: true,
        handler: join(nuxt.options.buildDir, 'loader/handler.mjs'),
      })
    })
  },
})
