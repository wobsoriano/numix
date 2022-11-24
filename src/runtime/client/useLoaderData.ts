import { getCacheKey } from './other'

export async function useLoaderData<T>() {
  const route = useRoute()
  const router = useRouter()

  const { data, error, refresh, pending: loading } = await useAsyncData<T>(getCacheKey('loader', route), () => {
    return $fetch(route.path, {
      query: {
        _data: route.name as string,
        _params: JSON.stringify(route.params),
      },
      onResponse({ response }) {
        const redirect = response.headers.get('x-numix-redirect')
        if (redirect)
          router.replace(redirect)
      },
    })
  })

  return {
    data,
    error,
    refresh,
    loading,
  }
}
