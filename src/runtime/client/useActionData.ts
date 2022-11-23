// @ts-expect-error: Nuxt
import { onScopeDispose, useRoute, useState } from '#imports'
import type { FetchError } from 'ofetch'
import { getCacheKey } from './other'

export function useActionData<T, E extends FetchError = FetchError>() {
  const route = useRoute()
  const data = useState<T | null>(getCacheKey('action', route), () => null)
  const error = useState<E | null>(getCacheKey('action:error', route), () => null)
  const submitting = useState<boolean>(getCacheKey('action:submitting', route), () => false)

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
