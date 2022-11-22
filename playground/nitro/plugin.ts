export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    // console.log(html)
  })

  nitro.hooks.hook('render:response', (response, { event }) => {
    // html.body.push('<div>hello world</div>')
    console.log(response)
  })
})
