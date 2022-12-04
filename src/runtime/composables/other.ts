import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
type KeyName = 'loader' | 'action'

export function getCacheKey(name: KeyName, route: RouteLocationNormalizedLoaded) {
  if (Object.keys(route.params).length > 0) {
    const hashed = hash(route.params)
    return `${name}:${getRoutePath(route)}:${hashed}`
  }

  return `${name}:${getRoutePath(route)}`
}

export function getSearchParams(route: RouteLocationNormalizedLoaded) {
  if (Object.keys(route.params).length > 0) {
    return {
      _data: getRoutePath(route),
      _params: JSON.stringify(route.params),
    }
  }

  return {
    _data: getRoutePath(route),
  }
}

export function getRoutePath(route: RouteLocationNormalizedLoaded) {
  const path = route.matched[0].path
  // @ts-expect-error: TODO
  const isIndexFile = route.matched[0].components!.default.__name === 'index'
  const toFilePath = path.split('/').map((i) => {
    return i.startsWith(':') ? `${i.replace(':', '[')}]` : i
  }).join('/')

  // Main index file: pages/index.vue
  if (route.name === 'index')
    return 'index'

  // Other index files: pages/other/index.vue
  if (isIndexFile)
    return `${toFilePath}/index`

  return toFilePath
}
