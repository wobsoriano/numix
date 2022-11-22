import type { AsyncData } from 'nuxt/dist/app/composables/asyncData'
import type { FetchError } from 'ofetch'
// @ts-expect-error: Nuxt
import { useFetch, useRoute } from '#imports'
import { createCacheKey } from '../utils/keys'

export async function useLoaderData<T, E = FetchError>() {
  const route = useRoute()
  const result = await useFetch<T, E>(route.path, {
    key: createCacheKey('loader', route),
    query: {
      _data: route.name as string,
    },
  })

  return result as AsyncData<T, E | null>
}
