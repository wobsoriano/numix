import type {
  AsyncDataOptions,
  KeyOfRes,
  _Transform,
} from 'nuxt/dist/app/composables/asyncData'
import { getCacheKey, getSearchParams } from './other'

import { navigateTo, useAsyncData, useNuxtApp, useRoute, useRouter } from '#imports'

/**
 * Returns the JSON parsed data from the current route's `loader`.
 */
export async function useLoaderData<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>,
>(options?: AsyncDataOptions<DataT, Transform, PickKeys>) {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const { data, error, refresh, pending } = await useAsyncData<DataT, DataE, Transform, PickKeys>(getCacheKey('loader', route), () => $fetch(route.path, {
    headers: {
      credentials: 'same-origin',
    },
    query: getSearchParams(route),
    onResponse({ response }) {
      const redirect = response.headers.get('X-NUMIX-REDIRECT')
      if (redirect || response.redirected) {
        if (nuxtApp && redirect)
          router.replace(redirect)
        else
          navigateTo(redirect || response.url, { replace: true, external: response.redirected })
      }
    },
  }), options)

  return {
    data,
    error,
    refresh,
    loading: pending,
  }
}
