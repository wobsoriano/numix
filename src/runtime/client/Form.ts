/*!
 * Original code by Matt Brophy
 * MIT Licensed, Copyright 2022 Matt Brophy, see https://github.com/brophdawg11/remix-routers/blob/main/LICENSE.md for details
 *
 * Credits to the Remix team:
 * https://github.com/brophdawg11/remix-routers/blob/main/packages/vue/src/remix-router-vue.ts
 */
import type { FormEncType, FormMethod } from './dom'
import { getFormSubmissionInfo } from './dom'

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null

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

  /**
   * Set `true` to replace the current entry in the browser's history stack
   * instead of creating a new one (i.e. stay on "the same page"). Defaults
   * to `false`.
   */
  replace?: boolean
}

const FormImpl = defineComponent({
  props: {
    replace: {
      type: Boolean,
      default: false,
    },
    onSubmit: {
      type: Function,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const route = useRoute()
    const submitter = ref<EventTarget | HTMLFormSubmitter | null>(null)
    const data = useAsyncData(getCacheKey('action', route), () => {
      return submitImpl(
        submitter.value as any,
        {
          method: attrs.method as FormMethod,
          replace: props.replace,
        },
      )
    }, {
      immediate: false,
      server: false,
    })

    return () => h(
      'form',
      {
        ...attrs,
        onSubmit(event: SubmitEvent) {
          props.onSubmit && props.onSubmit(event)
          if (event.defaultPrevented)
            return
          event.preventDefault()
          submitter.value = (event.submitter as HTMLFormSubmitter) || event.currentTarget
          data.execute({
            dedupe: true,
          }).then(() => refreshNuxtData(getCacheKey('loader', route)))
        },
      },
      slots.default?.(),
    )
  },
})

export const Form = defineComponent({
  props: {
    replace: {
      type: Boolean,
      default: false,
    },
    onSubmit: {
      type: Function,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () => h(FormImpl, { ...props }, slots.default)
  },
})

function submitImpl(
  target: SubmitTarget,
  options: SubmitOptions = {},
) {
  if (typeof document === 'undefined')
    throw new Error('Unable to submit during server render')

  const route = useRoute()
  const { method, encType, formData, url } = getFormSubmissionInfo(
    target,
    route.path,
    options,
  )

  const href = url.pathname + url.search

  let headers
  let body = formData
  if (encType === 'application/x-www-form-urlencoded') {
    body = new URLSearchParams()
    for (const [key, value] of formData!)
      body.append(key, value)

    headers = { 'Content-Type': encType }
  }

  return $fetch(href, {
    method,
    credentials: 'same-origin',
    headers,
    body,
    query: {
      _data: route.name as string,
      _params: JSON.stringify(route.params),
    },
    onResponse({ response }) {
      const redirect = response.headers.get('x-numix-redirect')
      if (redirect)
        useRouter().replace(redirect)
    },
  })

  // if (fetcherKey && routeId)
  //   router.fetch(fetcherKey, routeId, href, opts)
  // else
  //   router.navigate(href, opts)
}
