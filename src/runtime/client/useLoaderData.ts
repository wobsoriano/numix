import { getCacheKey } from './other'
import type { Ref } from 'vue'

/**
 * Returns the JSON parsed data from the current route's `loader`.
 */
export async function useLoaderData<T, E = Error>() {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const { data, error, refresh, pending } = await useAsyncData<T, E>(getCacheKey('loader', route), () => {
    return $fetch(route.path, {
      query: {
        _data: route.name as string,
        _params: JSON.stringify(route.params),
      },
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
  })

  return {
    data: data as Ref<T | null>,
    error: error as Ref<E | null>,
    refresh: refresh as () => Promise<void>,
    loading: pending as Ref<boolean>,
  }
}
