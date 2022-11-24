import { getCacheKey } from './other'

export async function useLoaderData<T>() {
  const route = useRoute()
  const router = useRouter()

  const result = await useAsyncData(getCacheKey('loader', route), () => {
    return $fetch<T>(route.path, {
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

  return result
}
