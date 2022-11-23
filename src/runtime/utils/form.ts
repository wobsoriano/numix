/*!
 * Original code by Remix Sofware Inc
 * MIT Licensed, Copyright(c) 2021 Remix software Inc, see LICENSE.remix.md for details
 *
 * Credits to the Remix team for the Form implementation:
 * https://github.com/remix-run/remix/blob/main/packages/remix-react/components.tsx#L865
 */
import type * as Vue from 'vue'
import { defineComponent, h, onMounted, onScopeDispose, ref } from 'vue'
import { useActionData } from '../composables/useActionData'
import type { FetchResponse } from 'ofetch'
import { createCacheKey } from './keys'

export interface FormAction<Data> {
  action: string
  method: string
  formData: Data
  encType: string
}

type FormEncType = 'application/x-www-form-urlencoded' | 'multipart/form-data'

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
/**
 * Submits a HTML `<form>` to the server without reloading the page.
 */

export interface SubmitFunction {
  (
    /**
     * Specifies the `<form>` to be submitted to the server, a specific
     * `<button>` or `<input type="submit">` to use to submit the form, or some
     * arbitrary data to submit.
     *
     * Note: When using a `<button>` its `name` and `value` will also be
     * included in the form data that is submitted.
     */
    target:
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | { [name: string]: string }
    | null,

    /**
     * Options that override the `<form>`'s own attributes. Required when
     * submitting arbitrary data without a backing `<form>`.
     */
    options?: SubmitOptions
  ): void
}

export type FormMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export const Form = defineComponent({
  props: {
    method: {
      type: String as Vue.PropType<FormMethod>,
      required: false,
      default: 'post',
    },
    encType: {
      type: String as Vue.PropType<FormEncType>,
      required: false,
      default: 'application/x-www-form-urlencoded',
    },
    reloadDocument: {
      type: Boolean,
      required: false,
      default: false,
    },
    replace: {
      type: Boolean,
      required: false,
      default: false,
    },
    action: {
      type: String,
      required: false,
      default: '/',
    },
  },
  setup(props, { slots }) {
    const route = useRoute()
    const response = useActionData()
    const loaderData = useLoaderData()
    const submit = useSubmitImpl(async (submission) => {
      const { protocol, host } = window.location
      const url = new URL(props.action as string, `${protocol}//${host}`)
      response.error.value = null
      response.submitting.value = true
      try {
        response.data.value = (await fetchData(url, route.name as string, submission))._data;
        (await loaderData).refresh()
      }
      catch (error) {
        response.data.value = null
        response.error.value = error as unknown as any
      }
      finally {
        response.submitting.value = false
      }
    })
    const method = props.method.toLowerCase() === 'get' ? 'get' : 'post'

    const clickedButtonRef = ref<any | null>(null)
    const form = ref<HTMLFormElement | null>(null)

    onMounted(() => {
      if (!form.value)
        return

      function handleClick(event: MouseEvent) {
        if (!(event.target instanceof HTMLElement))
          return
        const submitButton = event.target.closest<HTMLButtonElement | HTMLInputElement>(
          'button,input[type=submit]',
        )

        if (submitButton && submitButton.type === 'submit')
          clickedButtonRef.value = submitButton
      }

      form.value.addEventListener('click', handleClick)

      onScopeDispose(() => {
        form.value?.removeEventListener('click', handleClick)
      })
    })

    return () => h('form', {
      ref: form,
      method,
      action: route.path,
      encType: props.encType,
      onSubmit(event: SubmitEvent) {
        if (!props.reloadDocument) {
          if (event.defaultPrevented)
            return
          event.preventDefault()
          submit(clickedButtonRef.value || event.currentTarget, {
            method,
            replace: props.replace,
          })
          clickedButtonRef.value = null
        }
      },
    }, slots.default?.())
  },
})

export type ExtractComponentProps<TComponent> =
  TComponent extends new () => {
    $props: infer P
  }
    ? P
    : never

function getActionInit(
  submission: any,
): RequestInit {
  const { encType, method, formData } = submission

  let headers
  let body = formData

  if (encType === 'application/x-www-form-urlencoded') {
    body = new URLSearchParams()
    for (const [key, value] of formData)
      body.append(key, value)

    headers = { 'Content-Type': encType }
  }

  return {
    method,
    body,
    credentials: 'same-origin',
    headers,
  }
}

export async function fetchData<T>(
  url: URL,
  routeId: string,
  submission?: any,
): Promise<FetchResponse<T>> {
  const route = useRoute()
  const router = useRouter()
  url.searchParams.append('_data', routeId)
  url.searchParams.append('_params', JSON.stringify(route.params))

  if (submission) {
    const init = getActionInit(submission)
    const response = await $fetch.raw(url.href, {
      ...init,
      onResponse({ response }) {
        const redirect = response.headers.get('x-numix-redirect')
        if (redirect)
          router.replace(redirect)
      },
    })

    return response as any
  }

  const response = await $fetch.raw(url.href, {
    credentials: 'same-origin',
  })

  return response as any
}

export function useSubmitImpl(
  onSubmission: (sub: FormAction<FormData>) => void,
): SubmitFunction {
  return (target, options = {}) => {
    let method: string
    let action: string
    let encType: string
    let formData: FormData

    if (isFormElement(target)) {
      const submissionTrigger: HTMLButtonElement | HTMLInputElement = (options as any)
        .submissionTrigger

      method = options.method || target.method
      action = options.action || target.action
      encType = options.encType || target.enctype
      formData = new FormData(target)

      if (submissionTrigger && submissionTrigger.name)
        formData.append(submissionTrigger.name, submissionTrigger.value)
    }
    else if (
      isButtonElement(target)
      || (isInputElement(target) && (target.type === 'submit' || target.type === 'image'))
    ) {
      const form = target.form

      if (form == null)
        throw new Error('Cannot submit a <button> without a <form>')

      // <button>/<input type="submit"> may override attributes of <form>
      method = options.method || target.getAttribute('formmethod') || form.method
      action = options.action || target.getAttribute('formaction') || form.action
      encType = options.encType || target.getAttribute('formenctype') || form.enctype
      formData = new FormData(form)

      // Include name + value from a <button>
      if (target.name)
        formData.set(target.name, target.value)
    }
    else {
      if (isHtmlElement(target)) {
        throw new Error(
          'Cannot submit element that is not <form>, <button>, or ' + '<input type="submit|image">',
        )
      }

      method = options.method || 'get'
      action = options.action || '/'
      encType = options.encType || 'application/x-www-form-urlencoded'

      if (target instanceof FormData) {
        formData = target
      }
      else {
        formData = new FormData()

        if (target instanceof URLSearchParams) {
          for (const [name, value] of target)
            formData.append(name, value)
        }
        else if (target != null) {
          for (const name of Object.keys(target))
            formData.append(name, target[name])
        }
      }
    }

    const { protocol, host } = window.location
    const url = new URL(isButtonElement(action) ? '/' : action, `${protocol}//${host}`)

    if (method.toLowerCase() === 'get') {
      for (const [name, value] of formData) {
        if (typeof value === 'string')
          url.searchParams.append(name, value)

        else
          throw new Error('Cannot submit binary form data using GET')
      }
    }

    const submission: FormAction<FormData> = {
      formData,
      action: url.pathname + url.search,
      method: method.toUpperCase(),
      encType,
    }

    onSubmission(submission)
  }
}
function isHtmlElement(object: any): object is HTMLElement {
  return object != null && typeof object.tagName === 'string'
}
function isButtonElement(object: any): object is HTMLButtonElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === 'button'
}
function isFormElement(object: any): object is HTMLFormElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === 'form'
}
function isInputElement(object: any): object is HTMLInputElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === 'input'
}
