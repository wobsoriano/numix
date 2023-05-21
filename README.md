# Numix

Add [remix](https://remix.run/)-like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes) to your Nuxt page components.

```vue
<script lang="ts">
import { prisma } from '@/lib/prisma.server'

export async function loader() {
  const products = await prisma.product.findMany()
  return products
}
</script>

<script setup lang="ts">
const { data } = await useLoaderData<typeof loader>()
</script>

<template>
  <div>
    <h1>Products</h1>
    <div v-for="product in data" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>
```

## Documentation

For documentation about Numix please visit https://numix.vercel.app.

## Development

- Run `cp playground/.env.example playground/.env`
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

## License

MIT
