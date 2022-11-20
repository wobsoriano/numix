import type { H3Event } from 'h3'
// @ts-expect-error: Nuxt provided
import { useFetch, useRoute } from '#imports'

export async function useLoaderData<T, E extends Error = Error>() {
  const route = useRoute()
  const result = await useFetch<T, E>(route.path, {
    key: `data-${route.path}`,
    headers: {
      credentials: 'same-origin',
    },
    query: {
      _data: route.name,
    },
  })

  return result
}

export type AppData = any

export interface LoaderFunction {
  (event: Pick<H3Event, 'node' | 'context' | 'path'>): Promise<AppData> | AppData
}
