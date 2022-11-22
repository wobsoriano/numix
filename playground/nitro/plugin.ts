export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    // console.log(html)
    // console.log(getResponseHeader(event, 'x-numix-redirect'))
  })

  nitro.hooks.hook('render:response', async (response, { event }) => {
    // html.body.push('<div>hello world</div>')
    // console.log(getResponseHeader(event, 'x-numix-redirect'))
  })
})
