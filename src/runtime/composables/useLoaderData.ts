import type { AsyncData } from 'nuxt/dist/app/composables/asyncData'
import type { FetchError } from 'ofetch'
// @ts-expect-error: Nuxt
import { useFetch, useRoute, useRouter } from '#imports'
import { createCacheKey } from '../utils/keys'

export async function useLoaderData<T, E = FetchError>() {
  const route = useRoute()
  const router = useRouter()
  const result = await useFetch<T, E>(route.path, {
    key: createCacheKey('loader', route),
    query: {
      _data: route.name as string,
    },
    onResponse({ response }) {
      const redirect = response.headers.get('x-numix-redirect')
      if (redirect)
        router.replace(redirect)
    },
  })

  return result as AsyncData<T, E | null>
}
