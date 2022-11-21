import type { H3Event } from 'h3'
import { useRoute, useState } from '#imports'

export async function useActionData<T>() {
  const route = useRoute()
  const response = useState<T | null>(`data-action-${route.path}`, () => null)

  return response
}

export type AppData = any

export type LoaderEvent = Pick<H3Event, 'node' | 'context' | 'path'> & {
  params: Record<string, any>
}
export interface LoaderFunction {
  (event: LoaderEvent): Promise<AppData> | AppData
}
