import type { H3Event } from 'h3'
import { hash } from 'ohash'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
// @ts-expect-error: Nuxt
import { useFetch, useRoute } from '#imports'

function getLoaderKey(route: RouteLocationNormalizedLoaded) {
  const hashed = hash(route.params)
  return `loader:${route.name as string}:${hashed}`
}

export async function useLoaderData<T>() {
  const route = useRoute()
  const result = await useFetch<T>(route.path, {
    key: getLoaderKey(route),
    query: {
      _data: route.name as string,
    },
  })

  return result
}

export type AppData = any

export type LoaderEvent = Pick<H3Event, 'node' | 'context' | 'path'> & {
  params: Record<string, any>
}
export interface LoaderFunction {
  (event: LoaderEvent): Promise<AppData> | AppData
}
