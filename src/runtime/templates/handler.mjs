import { createError, eventHandler, getQuery, isMethod } from 'h3'

function dynamicImportVueSFC(src) {
  <% for(var i = 0; i < options.files.length; ++i) { %>
    if ("<%= options.files[i] %>".includes(src)) return import("<%= options.files[i] %>")
  <% } %>
}

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const isGet = isMethod(event, 'GET')

  if (query._data) {
    // eslint-disable-next-line prefer-template
    const { loader, action } = await dynamicImportVueSFC(query._data + '.vue')

    if (isGet && !loader) {
      throw createError({
        statusCode: 404,
        statusMessage: '[numix]: No loader function specified.'
      })
    }

    if (!isGet && !action) {
      throw createError({
        statusCode: 404,
        statusMessage: '[numix]: No action function specified.'
      })
    }

    if (!isGet) {
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
