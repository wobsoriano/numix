import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export function createCacheKey(name: string, route: RouteLocationNormalizedLoaded) {
  if (Object.keys(route.params).length > 0) {
    const hashed = hash(route.params)
    return `${name}:${route.name as string}:${hashed}`
  }

  return `${name}:${route.name as string}`
}
