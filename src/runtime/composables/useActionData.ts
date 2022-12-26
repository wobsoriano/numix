import type { Ref } from 'vue'
import { getCacheKey } from './other'
import { clearNuxtData, getCurrentInstance, onScopeDispose, useAsyncData, useRoute } from '#imports'

const noop = () => Promise.resolve(null)

/**
 * Returns the JSON parsed data from the current route's `action`.
 */
export function useActionData<T, E = Error>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending } = useAsyncData<T, E>(key, () => noop() as Promise<T>, {
    lazy: true,
    server: false,
  })

  if (getCurrentInstance()) {
    onScopeDispose(() => {
      clearNuxtData(key)
    })
  }

  return {
    data: data as Ref<T | null>,
    error: error as Ref<E | null>,
    refresh: refresh as () => Promise<void>,
    submitting: pending as Ref<boolean>,
  }
}
