import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export function createCacheKey(name: string, route: RouteLocationNormalizedLoaded) {
  const hashed = hash(route.params)
  return `${name}:${route.name as string}:${hashed}`
}
