import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type KeyName = 'loader' | 'action'

export function getCacheKey(name: KeyName, route: RouteLocationNormalizedLoaded) {
  if (Object.keys(route.params).length > 0) {
    const hashed = hash(route.params)
    return `${name}:${route.name as string}:${hashed}`
  }

  return `${name}:${route.name as string}`
}

export function getSearchParams(route: RouteLocationNormalizedLoaded) {
  if (Object.keys(route.params).length > 0) {
    return {
      _data: route.name as string,
      _params: JSON.stringify(route.params),
    }
  }

  return {
    _data: route.name as string,
  }
}
