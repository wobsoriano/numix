import type {
  AsyncData,
  AsyncDataOptions,
  KeyOfRes,
  PickFrom,
  _Transform,
} from 'nuxt/dist/app/composables/asyncData'
import { getCacheKey } from './other'
import { clearNuxtData, getCurrentInstance, onScopeDispose, useAsyncData, useRoute } from '#imports'

function noop() {
  return Promise.resolve(null)
}

/**
 * Returns the JSON parsed data from the current route's `action`.
 */
export async function useActionData<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>,
>(options?: AsyncDataOptions<DataT, Transform>): Promise<AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, DataE | null>> {
  const route = useRoute()
  const key = getCacheKey('action', route)
  const result = await useAsyncData<DataT, DataE, Transform>(key, () => noop() as Promise<DataT>, {
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
