// @ts-expect-error: Nuxt
import { onScopeDispose, useRoute, useState } from '#imports'
import { createCacheKey } from '../utils/keys'

export function useActionData<T>() {
  const route = useRoute()
  const data = useState<T | null>(createCacheKey('action', route), () => null)
  const error = useState<T | null>(createCacheKey('action:error', route), () => null)

  onScopeDispose(() => {
    data.value = null
    error.value = null
  })

  return {
    data,
    error,
  }
}
