# Introduction

## What is Numix?

Numix provides you with server side scripts inside your Nuxt pages, which will be called inside a [Nitro handler](https://nitro.unjs.io/guide/introduction/routing). Loader and action functions similar to [Remix](https://remix.run).

## How does it work?

Numix strips the exported `action` and `loader` functions in the browser and imports them in the server. Numix will then make sure to run your loader on the server and for client side navigations it fetches the data required by the page.

This enables us to import a database or any other stuff that should never reach the client directly inside your Nuxt pages.

Now if you have a `products.vue` page:

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
  <ProductList :items="data" />
</template>
```

The output will be something like this in the browser:

```js
export default defineComponent({
  async setup() {
    const { data } = await useLoaderData()

    return () => h(ProductList, {
      items: data
    })
  },
})
```

and in the server:

```js
export default eventHandler(async (event) => {
  const { loader } = await import('@/pages/todos.vue')
  return loader(event)
})
```
