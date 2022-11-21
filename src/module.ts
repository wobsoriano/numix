import * as fs from 'fs'
import { addComponent, addImports, addImportsDir, addServerHandler, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { join } from 'pathe'
import { compileScript, parse } from '@vue/compiler-sfc'
import dedent from 'dedent'
import type { Loader } from 'esbuild'
import virtual from '@rollup/plugin-virtual'
import { transform } from './runtime/utils/server'
import { removeExports } from './runtime/plugins'

export default defineNuxtModule({
  meta: {
    name: 'numix',
    configKey: 'numix',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const buildResolver = createResolver(nuxt.options.buildDir)
    const numixPath = buildResolver.resolve('numix')

    nuxt.options.build.transpile.push(resolver.resolve('runtime'), buildResolver.resolve('numix/handler.mjs'))

    const virtuals: Record<string, string> = {}

    nuxt.hook('pages:extend', (pages) => {
      const pageMap: Record<string, any> = {}
      for (const page of pages) {
        const content = fs.readFileSync(page.file, 'utf-8')
        const { descriptor } = parse(content)
        if (descriptor && descriptor.script) {
          const code = compileScript(descriptor, { id: page.file })
          virtuals[`virtual:numix:page:${page.name as string}`] = transform(descriptor.script.content, {
            loader: code.lang as Loader,
            minify: false,
          })
          pageMap[page.name as string] = {
            ...page,
            importName: `virtual:numix:page:${page.name as string}`,
          }
        }
      }

      virtuals['virtual:numix:event:handler'] = `
        import { eventHandler, getQuery, isMethod } from 'h3';
        import { createRouter } from 'radix3';

        async function getLoaderByRouteId (id) {
          ${Object.values(pageMap).map(page => `if (id === '${page.name}') { return import('${page.importName}') }`).join('\n')}
        }
        
        const pageMap = ${JSON.stringify(pageMap)};

        const router = createRouter();
        Object.keys(pageMap).forEach((page) => {
          router.insert(pageMap[page].path, {
            payload: pageMap[page]
          });
        })

        function routeLookup(_path) {
          const [path] = _path.split('?');
          const result = router.lookup(path);
          return result;
        }

        export default eventHandler(async (event) => {
          const query = getQuery(event);
          const isGet = isMethod(event, 'GET');

          if (!event.path.includes('favicon')) {
            console.log(event.node.req.method, event.path)
          }

          if (query._data) {
            const { loader, action } = await getLoaderByRouteId(query._data);

            if (!isGet && action) {
              console.log('HELLO')
              return action({
                node: event.node,
                path: event.path,
                context: event.context,
                params: routeLookup(event.path)?.params ?? {},
              })
            }

            return loader({
              node: event.node,
              path: event.path,
              context: event.context,
              params: routeLookup(event.path)?.params ?? {},
            })
          }
        })
      `
    })

    addServerHandler({
      middleware: true,
      handler: 'virtual:numix:event:handler',
    })

    nuxt.hook('nitro:config', (config) => {
      config.rollupConfig = config.rollupConfig || {}
      config.rollupConfig.plugins = config.rollupConfig.plugins || []
      config.rollupConfig.plugins.push(virtual(virtuals))
    })

    addVitePlugin(removeExports())

    nuxt.hook('builder:watch', async (e, path) => {
      if (!path.match(/\.vue$/))
        return
      await nuxt.callHook('builder:generateApp')
    })

    addImportsDir([
      resolver.resolve('runtime/composables'),
    ])
  },
})
