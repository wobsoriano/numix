import * as fs from 'fs/promises'
import { join } from 'pathe'

export function virtualLoaders(buildDir: string) {
  return {
    name: 'numix-virtual-handlers',
    resolveId(id: string) {
      if (id.startsWith('virtual:handler:'))
        return id
    },
    async load(id: string) {
      if (id.startsWith('virtual:handler:')) {
        const routeId = id.split(':')[2]
        const routes = await fs.readFile(join(buildDir, 'loader/routes.json'), 'utf-8')
        const parsed = JSON.parse(routes) as Record<string, any>

        const route = parsed[routeId]
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
