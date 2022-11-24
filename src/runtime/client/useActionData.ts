import { getCacheKey } from './other'

const noop = () => Promise.resolve()

export async function useActionData<T>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending: submitting } = useAsyncData<T>(key, () => noop() as any, {
    lazy: true,
    server: false,
  })

  onScopeDispose(() => {
    clearNuxtData(key)
  })

  return {
    data,
    error,
    refresh,
    submitting,
  }
}
