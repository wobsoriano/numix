// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['numix'],
  imports: {
    autoImport: true,
  },
  nitro: {
    plugins: ['~/nitro/plugin'],
  },
})
