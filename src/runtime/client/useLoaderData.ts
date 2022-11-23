import type { AsyncData } from 'nuxt/dist/app/composables/asyncData'
import type { FetchError } from 'ofetch'
// @ts-expect-error: Nuxt
import { useFetch, useRoute, useRouter } from '#imports'
import { getCacheKey } from './other'

export async function useLoaderData<T, E = FetchError>(opts?: Record<string, any>) {
  const route = useRoute()
  const router = useRouter()
  const result = await useFetch<T, E>(route.path, {
    key: getCacheKey('loader', route),
    query: {
      _data: route.name as string,
      _params: JSON.stringify(route.params),
    },
    onResponse({ response }) {
      const redirect = response.headers.get('x-numix-redirect')
      if (redirect)
        router.replace(redirect)
    },
    ...opts,
  })

  return result as AsyncData<T, E | null>
}
