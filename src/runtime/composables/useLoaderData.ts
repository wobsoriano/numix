import type { Ref } from 'vue'
import { getCacheKey, getSearchParams } from './other'

import { navigateTo, useFetch, useNuxtApp, useRoute, useRouter } from '#imports'

/**
 * Returns the JSON parsed data from the current route's `loader`.
 */
export async function useLoaderData<T, E = Error>() {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const { data, error, refresh, pending } = await useFetch<T, E>(route.path, {
    key: getCacheKey('loader', route),
    headers: {
      credentials: 'same-origin',
    },
    query: getSearchParams(route),
    onResponse({ response }) {
      const redirect = response.headers.get('x-numix-redirect')
      if (redirect || response.redirected) {
        if (nuxtApp && redirect)
          router.replace(redirect)
        else
          navigateTo(redirect || response.url, { replace: true, external: response.redirected })
      }
    },
  })

  return {
    data: data as Ref<T | null>,
    error: error as Ref<E | null>,
    refresh: refresh as () => Promise<void>,
    loading: pending as Ref<boolean>,
  }
}
