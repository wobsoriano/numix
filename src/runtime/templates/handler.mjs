import { createError, eventHandler, getQuery, isMethod } from 'h3'

async function getLoaderByRouteId(id) {
  // PUT_PAGE_CONDITION_HERE
}

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const isGet = isMethod(event, 'GET')

  if (query._data) {
    const { loader, action } = await getLoaderByRouteId(query._data)

    if (!loader && !action) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No loader/action function defined.',
      })
    }

    if (!isGet && action) {
      return action({
        node: event.node,
        path: event.path,
        context: event.context,
        params: JSON.parse(query._params || '{}'),
      })
    }

    return loader({
      node: event.node,
      path: event.path,
      context: event.context,
      params: JSON.parse(query._params || '{}'),
    })
  }
})
