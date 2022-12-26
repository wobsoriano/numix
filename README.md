# Numix

Add [remix](https://remix.run/)-like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes) to your Nuxt page components.

```vue
<script lang="ts">
import type { Product } from '@prisma/client'
import { prisma } from '@/lib/prisma.server'

export const loader: LoaderFunction = async () => {
  const products = await prisma.product.findMany()
  return products
}
</script>

<script setup lang="ts">
const { data } = await useLoaderData<Product[]>()
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

## Credits

- [Remix](https://remix.run/) for the `Form` implementation.
- [Rakkas](https://github.com/rakkasjs/rakkasjs) for the named exports strip logic. Implemented in [unplugin-strip-exports](https://github.com/wobsoriano/unplugin-strip-exports).

## License

MIT
