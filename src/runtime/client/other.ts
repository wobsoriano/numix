import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type KeyName = 'loader' | 'action' | 'action:error' | 'action:submitting'

export function getCacheKey(name: KeyName, route: RouteLocationNormalizedLoaded) {
  if (Object.keys(route.params).length > 0) {
    const hashed = hash(route.params)
    return `${name}:${route.name as string}:${hashed}`
  }

  return `${name}:${route.name as string}`
}
