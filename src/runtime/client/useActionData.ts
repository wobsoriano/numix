import { getCacheKey } from './other'
import type { Ref } from 'vue'

const noop = () => Promise.resolve()

export async function useActionData<T, E = Error>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending } = useAsyncData<T, E>(key, () => noop() as any, {
    lazy: true,
    server: false,
  })

  onScopeDispose(() => {
    clearNuxtData(key)
  })

  return {
    data: data as Ref<T | null>,
    error: error as Ref<Error | null>,
    refresh: refresh as () => Promise<void>,
    submitting: pending as Ref<boolean>,
  }
}
