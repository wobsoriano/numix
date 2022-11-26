import { getCacheKey } from './other'
import type { Ref } from 'vue'

const noop = () => Promise.resolve()

/**
 * Returns the JSON parsed data from the current route's `action`.
 */
export async function useActionData<T, E = Error>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending } = await useAsyncData<T, E>(key, () => noop() as any, {
    lazy: true,
    server: false,
  })

  onScopeDispose(() => {
    clearNuxtData(key)
  })

  return {
    data: data as Ref<T | null>,
    error: error as Ref<E | null>,
    refresh: refresh as () => Promise<void>,
    submitting: pending as Ref<boolean>,
  }
}
