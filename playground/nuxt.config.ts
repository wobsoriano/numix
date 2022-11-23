// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['numix'],
  imports: {
    autoImport: true,
  },
  nitro: {
    plugins: ['~/nitro/plugin'],
  },
  hooks: {
    'vite:serverCreated': function (viteServer) {
      viteServer.middlewares.use((req, res, next) => {
        if (req.url !== '/__url/favicon.ico')
          console.log(req.url)
        next()
      })
    },
  },
})
