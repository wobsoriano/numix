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
  return route.name as string
}
