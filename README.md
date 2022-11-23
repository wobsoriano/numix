# Numix

Add [remix](https://remix.run/)-like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes) to your Nuxt page components.

> ⚠️ Experimental. This documentation is a work-in-progress.

## What is Numix?

Numix provides you with server side scripts inside your Nuxt pages, which will be transformed to a virtual module and called inside an [h3](https://github.com/unjs/h3) event handler. Loader functions and actions similar to remix.

## How does it work?

Numix places all the code inside `<script>` in a virtual module and simulates the corresponding endpoint. Numix will then make sure to run your loader on the server and for client side navigations it fetches the data required by the page.

This enables us to import a database or any other stuff that should never reach the client directly inside your Nuxt pages.

## Install

```bash
pnpm add numix
```

```ts
export default defineNuxtConfig({
  modules: ['numix'],
})
```

## Usage

### Data Loading

Simplify interactions with the server to get data into your Vue pages/routes. Each `.vue` page can export a `loader` function, this `loader` should return a JSON serializable data like how you would with event handlers.

```vue
<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import type { Product } from '@prisma/client'

export const loader: LoaderFunction = async (event) => {
  return prisma.product.findFirstOrThrow({
    where: {
      id: Number(event.params.id),
    },
  })
}
</script>

<script setup lang="ts">
// Access the returned data using the useLoaderData composable.
const { data, error } = await useLoaderData<Product>()
</script>

<template>
  <div>
    <YourProductComponent v-if="data" />
    <ErrorComponent v-else :error="error" />
  </div>
</template>
```

### Data Writes

Each `.vue` page can also define an action function. This action gets called on submit by the Numix `Form` component and numix automatically invalidates the data of your current page.

```vue
<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import type { Product } from '@prisma/client'

export const action: ActionFunction = async (event) => {
  const body = await readBody(event)
  const result = await prisma.product.create({ data: { ...body } })
  return result
}
</script>

<script setup lang="ts">
import { Form } from 'numix/form'
// Access the returned data using the useActionData composable.
const { data, error } = await useActionData<Product>()
</script>

<template>
  <Form method="post">
    <input type="text" name="name">
    <input type="text" name="price">
    <button>Submit</button>
  </Form>
</template>
```

When you access this page (on a hard reload), you'll get 2 requests:

1. http://localhost:3000/products/1
2. http://localhost:3000/products/1?_data=products-id

## License

MIT
