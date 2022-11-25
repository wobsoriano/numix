import { getCacheKey } from './other'
import type { Ref } from 'vue'

export async function useLoaderData<T, E = Error>() {
  const route = useRoute()

  const { data, error, refresh, pending } = await useAsyncData<T, E>(getCacheKey('loader', route), () => {
    return $fetch(route.path, {
      query: {
        _data: route.name as string,
        _params: JSON.stringify(route.params),
      },
      onResponse({ response }) {
        const redirect = response.headers.get('x-numix-redirect')
        if (redirect)
          navigateTo(redirect, { replace: true })
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
