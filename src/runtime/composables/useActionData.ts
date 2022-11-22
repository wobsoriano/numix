// @ts-expect-error: Nuxt
import { onScopeDispose, useRoute, useState } from '#imports'
import type { FetchError } from 'ofetch'
import { createCacheKey } from '../utils/keys'

export function useActionData<T, E extends FetchError = FetchError>() {
  const route = useRoute()
  const data = useState<T | null>(createCacheKey('action', route), () => null)
  const error = useState<E | null>(createCacheKey('action:error', route), () => null)
  const submitting = useState<boolean>(createCacheKey('action:submitting', route), () => false)

  onScopeDispose(() => {
    data.value = null
    error.value = null
    submitting.value = false
  })

  return {
    data,
    error,
    submitting,
  }
}
