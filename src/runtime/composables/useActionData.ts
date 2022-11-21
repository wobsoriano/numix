import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

function getActionKey(route: RouteLocationNormalizedLoaded) {
  const hashed = hash(route.params)
  return `action:${route.name as string}:${hashed}`
}

function getActionErrorKey(route: RouteLocationNormalizedLoaded) {
  const hashed = hash(route.params)
  return `action:error:${route.name as string}:${hashed}`
}

export function useActionData<T>() {
  const route = useRoute()
  const data = useState<T | null>(getActionKey(route), () => null)
  const error = useState<T | null>(getActionErrorKey(route), () => null)

  onScopeDispose(() => {
    data.value = null
    error.value = null
  })

  return {
    data,
    error,
  }
}
