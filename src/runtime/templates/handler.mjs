import { createError, eventHandler, getQuery, isMethod } from 'h3'
import { router } from '#numix/route-modules'

export default eventHandler((event) => {
  const query = getQuery(event)
  const isGet = isMethod(event, 'GET')

  if (query._data) {
    const { loader, action } = router[query._data]

    if (isGet && !loader) {
      throw createError({
        statusCode: 400,
        statusMessage: '[numix]: No loader function specified.',
      })
    }

    if (!isGet && !action) {
      throw createError({
        statusCode: 400,
        statusMessage: '[numix]: No action function specified.',
      })
    }

    if (!isGet) {
      return action({
        node: event.node,
        path: event.path,
        headers: event.headers,
        context: event.context,
        method: event.method,
        params: JSON.parse(query._params || '{}'),
      })
    }

    return loader({
      node: event.node,
      path: event.path,
      headers: event.headers,
      context: event.context,
      method: event.method,
      params: JSON.parse(query._params || '{}'),
    })
  }
})
