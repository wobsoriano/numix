import { parseURL } from 'ufo'
import { getCacheKey, getSearchParams } from '../composables/other'
import { defineComponent, h, navigateTo, shallowRef, refreshNuxtData, useAsyncData, useRoute } from '#imports'

const defaultMethod = 'get'
const defaultEncType = 'application/x-www-form-urlencoded'

const Form = defineComponent({
  props: {
    /**
     * The action URL path used to submit the form. Overrides `<form action>`.
     * Defaults to the path of the current route.
     *
     * Note: It is assumed the path is already resolved. If you need to resolve a
     * relative path, use `useFormAction`.
     */
    action: {
      type: String,
      required: false,
      default: '/',
    },
    /**
     * The action URL used to submit the form. Overrides `<form encType>`.
     * Defaults to "application/x-www-form-urlencoded".
     */
    encType: {
      type: String,
      required: false,
      default: defaultEncType,
    },
    /**
     * The HTTP method used to submit the form. Overrides `<form method>`.
     * Defaults to "get".
     */
    method: {
      type: String,
      required: false,
      default: defaultMethod,
    },
  },
  setup(props, { slots }) {
    const route = useRoute()
    const formData = shallowRef<FormData | null>(null)
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
          body?.append(key, value)

        headers.append('Content-Type', encType)
      }

      return globalThis.$fetch(href, {
        method: (props.method || defaultMethod).toUpperCase() as any,
        credentials: 'same-origin',
        headers,
        body,
        query: getSearchParams(route),
        onResponse({ response }) {
          const redirect = response.headers.get('X-NUMIX-REDIRECT')
          if (redirect || response.redirected) {
            const parsed = parseURL(redirect || response.url)
            navigateTo(`${parsed.pathname}${parsed.search}`, { external: response.redirected && import.meta.server })
          }
        },
      })
    }

    return () => h('form', {
      async onSubmit(e: SubmitEvent) {
        e.preventDefault()
        formData.value = new FormData(e.currentTarget as HTMLFormElement)
        await data.execute({ dedupe: true })
        await refreshNuxtData(getCacheKey('loader', route))
      },
    }, slots.default?.())
  },
})

export default Form
