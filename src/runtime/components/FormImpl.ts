/*!
 * Original code by Matt Brophy
 * MIT Licensed, Copyright 2022 Matt Brophy, see https://github.com/brophdawg11/remix-routers/blob/main/LICENSE.md for details
 *
 * Credits to the Remix team:
 * https://github.com/brophdawg11/remix-routers/blob/main/packages/vue/src/remix-router-vue.ts
 */
import type { FormMethod, SubmitOptions } from '../utils/dom'
import { getFormSubmissionInfo } from '../utils/dom'
import { defineComponent, h, navigateTo, refreshNuxtData, useAsyncData, useRoute } from '#imports'
import { $fetch } from 'ofetch'
import { getCacheKey, getSearchParams } from '../composables/other'

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null

export default defineComponent({
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

async function submitImpl(
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

  const response = await $fetch.raw(href, {
    method,
    credentials: 'same-origin',
    headers,
    body,
    query: getSearchParams(route),
    onResponse({ response }) {
      const redirect = response.headers.get('x-numix-redirect')
      if (redirect || response.redirected)
        navigateTo(redirect || response.url, { replace: true, external: response.redirected })
    },
  })

  return response._data

  // if (fetcherKey && routeId)
  //   router.fetch(fetcherKey, routeId, href, opts)
  // else
  //   router.navigate(href, opts)
}
