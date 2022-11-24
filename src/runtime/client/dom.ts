/*!
 * Original code by Matt Brophy
 * MIT Licensed, Copyright 2022 Matt Brophy, see https://github.com/brophdawg11/remix-routers/blob/main/LICENSE.md for details
 *
 * Credits to the Remix team:
 * https://github.com/brophdawg11/remix-routers/blob/main/packages/vue/src/dom.ts
 */
export type FormMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type FormEncType = 'application/x-www-form-urlencoded' | 'multipart/form-data'

export const defaultMethod = 'get'
const defaultEncType = 'application/x-www-form-urlencoded'

export function isHtmlElement(object: any): object is HTMLElement {
  return object != null && typeof object.tagName === 'string'
}

export function isButtonElement(object: any): object is HTMLButtonElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === 'button'
}

export function isFormElement(object: any): object is HTMLFormElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === 'form'
}

export function isInputElement(object: any): object is HTMLInputElement {
  return isHtmlElement(object) && object.tagName.toLowerCase() === 'input'
}

type LimitedMouseEvent = Pick<
  MouseEvent,
  'button' | 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'
>

function isModifiedEvent(event: LimitedMouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}

export function shouldProcessLinkClick(
  event: LimitedMouseEvent,
  target?: string,
) {
  return (
    event.button === 0 // Ignore everything but left clicks
    && (!target || target === '_self') // Let browser handle "target=_blank" etc.
    && !isModifiedEvent(event) // Ignore clicks with modifier keys
  )
}

export type ParamKeyValuePair = [string, string]

export type URLSearchParamsInit =
  | string
  | ParamKeyValuePair[]
  | Record<string, string | string[]>
  | URLSearchParams

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
export function createSearchParams(
  init: URLSearchParamsInit = '',
): URLSearchParams {
  return new URLSearchParams(
    typeof init === 'string'
    || Array.isArray(init)
    || init instanceof URLSearchParams
      ? init
      : Object.keys(init).reduce((memo, key) => {
        const value = init[key]
        return memo.concat(
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]],
        )
      }, [] as ParamKeyValuePair[]),
  )
}

export function getSearchParamsForLocation(
  locationSearch: string,
  defaultSearchParams: URLSearchParams,
) {
  const searchParams = createSearchParams(locationSearch)

  for (const key of defaultSearchParams.keys()) {
    if (!searchParams.has(key)) {
      defaultSearchParams.getAll(key).forEach((value) => {
        searchParams.append(key, value)
      })
    }
  }

  return searchParams
}

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

export function getFormSubmissionInfo(
  target:
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null,
  defaultAction: string,
  options: SubmitOptions,
): {
    url: URL
    method: string | undefined
    encType: string | undefined
    formData: FormData | undefined
  } {
  let method: string | undefined
  let action: string
  let encType: string | undefined
  let formData: FormData | undefined

  if (isFormElement(target)) {
    const submissionTrigger: HTMLButtonElement | HTMLInputElement = (
      options as any
    ).submissionTrigger

    method = options.method || target.getAttribute('method') || defaultMethod
    action = options.action || target.getAttribute('action') || defaultAction
    encType
      = options.encType || target.getAttribute('enctype') || defaultEncType

    formData = new FormData(target)

    if (submissionTrigger && submissionTrigger.name)
      formData.append(submissionTrigger.name, submissionTrigger.value)
  }
  else if (
    isButtonElement(target)
    || (isInputElement(target)
      && (target.type === 'submit' || target.type === 'image'))
  ) {
    const form = target.form

    if (form == null) {
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>',
      )
    }

    // <button>/<input type="submit"> may override attributes of <form>

    method
      = options.method
      || target.getAttribute('formmethod')
      || form.getAttribute('method')
      || defaultMethod
    action
      = options.action
      || target.getAttribute('formaction')
      || form.getAttribute('action')
      || defaultAction
    encType
      = options.encType
      || target.getAttribute('formenctype')
      || form.getAttribute('enctype')
      || defaultEncType

    formData = new FormData(form)

    // Include name + value from a <button>
    if (target.name)
      formData.set(target.name, target.value)
  }
  else if (isHtmlElement(target)) {
    throw new Error(
      'Cannot submit element that is not <form>, <button>, or '
        + '<input type="submit|image">',
    )
  }
  else {
    method = options.method || defaultMethod
    action = options.action || defaultAction
    encType = options.encType || defaultEncType

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
  const url = new URL(action, `${protocol}//${host}`)

  if (method.toLowerCase() === 'get') {
    for (const [name, value] of formData) {
      if (typeof value === 'string')
        url.searchParams.append(name, value)

      else
        throw new Error('Cannot submit binary form data using GET')
    }
  }

  return { url, method, encType, formData }
}
