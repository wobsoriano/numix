import { getCacheKey } from './other'
import { clearNuxtData, onScopeDispose, useAsyncData, useRoute } from '#imports'
import type { Ref } from 'vue'

const noop = () => Promise.resolve(null)

/**
 * Returns the JSON parsed data from the current route's `action`.
 */
export async function useActionData<T, E = Error>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending } = await useAsyncData<T, E>(key, () => noop() as Promise<T>, {
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
