import * as fs from 'fs/promises'

export function virtualLoaders() {
  return {
    name: 'virtual-handlers',
    resolveId(id: string) {
      if (id.startsWith('virtual:handler:'))
        return id
    },
    async load(id: string) {
      if (id.startsWith('virtual:handler:')) {
        const routeId = id.split(':')[2]
        const routes = await fs.readFile('.nuxt/loader/routes.json', 'utf-8')
        const parsed = JSON.parse(routes) as any[]

        const route = parsed.find(i => i.name === routeId)
        if (!route) {
          return {
            code: 'export const loader = () => null',
          }
        }

        return {
          code: route.loader,
        }
      }
    },
  }
}
