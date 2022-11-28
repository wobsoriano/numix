# Data Loading

One of the primary features of numix is simplifying interactions with the server to get data into your Nuxt pages/routes, this happens by making use of event handlers.

## Basics

Each `.vue` file inside your `pages` folder can export a `loader` function, this loader should return a JSON serializable data like how you would with event handlers. `useLoaderData` will provide the loader's data to your component:

```vue
<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import type { Product } from '@prisma/client'

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

The `.server` part of the filename informs Numix that this code should never end up in the browser. This is optional, because Numix does a good job of ensuring server code doesn't end up in the client.
