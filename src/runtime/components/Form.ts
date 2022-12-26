import { getCacheKey, getSearchParams } from '../composables/other'
import { defineComponent, h, navigateTo, ref, useAsyncData, useRoute } from '#imports'

export type FormMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type FormEncType = 'application/x-www-form-urlencoded' | 'multipart/form-data'

export interface SubmitOptions {
  /**
   * The HTTP method used to submit the form. Overrides `<form method>`.
   * Defaults to "GET".
   */
  method?: FormMethod

  /**
   * The action URL path used to submit the form. Overrides `<form action>`.
   * Defaults to the path of the current route.
   *
   * Note: It is assumed the path is already resolved. If you need to resolve a
   * relative path, use `useFormAction`.
   */
  action?: string

  /**
   * The action URL used to submit the form. Overrides `<form encType>`.
   * Defaults to "application/x-www-form-urlencoded".
   */
  encType?: FormEncType
}

const defaultMethod = 'GET'
const defaultEncType = 'application/x-www-form-urlencoded'

const Form = defineComponent((props: SubmitOptions, { attrs, slots }) => {
  const route = useRoute()
  const formRef = ref<HTMLFormElement | null>(null)
  const submitting = ref(false)
  const formData = ref<FormData | null>(null)
  const data = useAsyncData(getCacheKey('action', route), () => submitImpl(), {
    immediate: false,
    server: false,
  })

  function submitImpl() {
    const { protocol, host } = window.location
    const url = new URL(props.action || route.path, `${protocol}//${host}`)
    const href = url.pathname + url.search
    const encType = props.encType || defaultEncType

    const headers = new Headers()
    let body = formData.value
    if (encType === 'application/x-www-form-urlencoded') {
      body = new URLSearchParams()
      for (const [key, value] of formData.value!)
        body.append(key, value)

      headers.append('Content-Type', encType)
    }

    return $fetch(href, {
      method: (props.method || defaultMethod).toUpperCase(),
      credentials: 'same-origin',
      headers,
      body,
      query: getSearchParams(route),
      onResponse({ response }) {
        const redirect = response.headers.get('X-NUMIX-REDIRECT')
        if (redirect || response.redirected)
          navigateTo(redirect || response.url, { replace: true, external: response.redirected })
      },
    })
  }

  return () => h('form', {
    ref: formRef,
    async onSubmit(e: SubmitEvent) {
      e.preventDefault()
      formData.value = new FormData(e.currentTarget as HTMLFormElement)
      await data.execute()
    },
  }, slots.default?.({ submitting: submitting.value }))
})

export default Form
