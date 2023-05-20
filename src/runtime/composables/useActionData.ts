import type {
  AsyncData,
  AsyncDataOptions,
  KeysOf,
  PickFrom,
} from 'nuxt/dist/app/composables/asyncData'
import { getCacheKey } from './other'
import {
  clearNuxtData,
  getCurrentInstance,
  onScopeDispose,
  useAsyncData,
  useRoute,
} from '#imports'

function noop() {
  return Promise.resolve(null)
}

/**
 * Returns the JSON parsed data from the current route's `action`.
 */
export async function useActionData<
  ResT,
  DataE = Error,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
>(options?: AsyncDataOptions<ResT, DataT, PickKeys>): Promise<AsyncData<PickFrom<DataT, PickKeys>, DataE | null>> {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const result = await useAsyncData<ResT>(key, () => noop() as Promise<ResT>, {
    lazy: true,
    server: false,
    ...options,
  } as any)

  if (getCurrentInstance()) {
    onScopeDispose(() => {
      clearNuxtData(key)
    })
  }

  return result as any
}
