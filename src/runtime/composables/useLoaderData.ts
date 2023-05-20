import type {
  AsyncData,
  AsyncDataOptions,
  KeysOf,
  PickFrom,
} from 'nuxt/dist/app/composables/asyncData'
import { getCacheKey, getSearchParams } from './other'

import {
  navigateTo,
  useAsyncData,
  useNuxtApp,
  useRoute,
  useRouter,
} from '#imports'

/**
 * Returns the JSON parsed data from the current route's `loader`.
 */
export async function useLoaderData<
  ResT,
  DataE = Error,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
>(options?: AsyncDataOptions<ResT, DataT, PickKeys>): Promise<AsyncData<PickFrom<DataT, PickKeys>, DataE | null>> {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const result = await useAsyncData<ResT>(getCacheKey('loader', route), () => $fetch(route.path, {
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
  }), options as any)

  return result as any
}
