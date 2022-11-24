import { getCacheKey } from './other'

const noop = () => Promise.resolve(null)

export async function useActionData<T, E = Error>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending: submitting } = useAsyncData<T, E>(key, () => noop() as Promise<T>, {
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
