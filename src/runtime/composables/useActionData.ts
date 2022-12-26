import type {
  AsyncDataOptions,
  KeyOfRes,
  _Transform,
} from 'nuxt/dist/app/composables/asyncData'
import { getCacheKey } from './other'
import { clearNuxtData, getCurrentInstance, onScopeDispose, useAsyncData, useRoute } from '#imports'

const noop = () => Promise.resolve(null)

/**
 * Returns the JSON parsed data from the current route's `action`.
 */
export function useActionData<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>,
>(options?: AsyncDataOptions<DataT, Transform, PickKeys>) {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const { data, error, refresh, pending } = useAsyncData<DataT, DataE, Transform, PickKeys>(key, () => noop() as Promise<DataT>, {
    lazy: true,
    server: false,
    ...options,
  })

  if (getCurrentInstance()) {
    onScopeDispose(() => {
      clearNuxtData(key)
    })
  }

  return {
    data,
    error,
    refresh,
    submitting: pending,
  }
}
