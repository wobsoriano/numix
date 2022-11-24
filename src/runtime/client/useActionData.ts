import { getCacheKey } from './other'

const noop = () => Promise.resolve(null)

export async function useActionData<T, E = Error>() {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const data = useAsyncData<T, E>(key, () => noop() as Promise<T>, {
    server: false,
  })

  onScopeDispose(() => {
    clearNuxtData(key)
  })

  return data
}
