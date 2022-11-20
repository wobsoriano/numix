import * as fs from 'fs'
import { addImports, addServerHandler, addVitePlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { join } from 'pathe'
import { compileScript, parse } from '@vue/compiler-sfc'
import dedent from 'dedent'
import type { Loader } from 'esbuild'
import virtual from '@rollup/plugin-virtual'
import { transform } from './runtime/utils'
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

    nuxt.options.build.transpile.push(resolver.resolve('runtime'), 'numix/composables')

    const virtuals: Record<string, string> = {}

    nuxt.hook('pages:extend', (pages) => {
      if (!fs.existsSync(numixPath))
        fs.mkdirSync(numixPath)

      const pageMap: Record<string, any> = {}
      for (const page of pages) {
        const content = fs.readFileSync(page.file, 'utf-8')
        const { descriptor } = parse(content)
        if (descriptor && descriptor.script) {
          const code = compileScript(descriptor, { id: page.file })
          virtuals[`virtual:handler:${page.name as string}`] = transform(descriptor.script.content, {
            loader: code.lang as Loader,
            minify: true,
          })
          pageMap[page.name as string] = {
            ...page,
            // action: stripFunction(descriptor.script.content, 'action'),
          }
        }
      }

      const paths: string[] = []
      Object.values(pageMap).forEach((page) => {
        paths.push(page.path)
      })

      fs.writeFileSync(join(numixPath, 'handler.mjs'), dedent`
        import { eventHandler, getQuery } from 'h3';
        import { createRouter } from 'radix3';

        async function getLoaderByRouteId (id) {
          ${Object.values(pageMap).map(page => `if (id === '${page.name}') { return import('virtual:handler:${page.name}') }`).join('\n')}
        }

        const router = createRouter();
        ${JSON.stringify(paths)}.forEach((_path) => {
          router.insert(_path, {});
        });

        function routeLookup(_path) {
          const [path] = _path.split('?');
          const result = router.lookup(path);
          return result?.params ?? {};
        }

        export default eventHandler(async (event) => {
          const query = getQuery(event);
          if (query._data) {
            const { loader } = await getLoaderByRouteId(query._data);
            return loader({
              node: event.node,
              context: event.context,
              path: event.path,
              params: routeLookup(event.path),
            })
          }
        })
      `)
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

    addServerHandler({
      middleware: true,
      handler: buildResolver.resolve('numix/handler.mjs'),
      lazy: true,
    })

    // addImportsDir([resolver.resolve('runtime/composables')])
    addImports({
      name: 'useLoaderData',
      as: 'useLoaderData',
      from: 'numix/composables',
    })
  },
})
