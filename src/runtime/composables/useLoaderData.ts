import { hash } from 'ohash'
import type { AsyncData } from 'nuxt/dist/app/composables/asyncData'
import type { FetchError } from 'ofetch'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
// @ts-expect-error: Nuxt
import { useFetch, useRoute } from '#imports'

function getLoaderKey(route: RouteLocationNormalizedLoaded) {
  const hashed = hash(route.params)
  return `loader:${route.name as string}:${hashed}`
}

export async function useLoaderData<T, E = FetchError>() {
  const route = useRoute()
  const result = await useFetch<T, E>(route.path, {
    key: getLoaderKey(route),
    query: {
      _data: route.name as string,
    },
  })

  return result as AsyncData<T, E | null>
}
