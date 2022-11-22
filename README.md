# Numix

Add [remix](https://remix.run/)-like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes) to your Nuxt page components.

> ⚠️ Experimental. This documentation is a work-in-progress.

## What is Numix?

Numix provides you with server side scripts inside your Nuxt pages, which will be transformed to a [h3](https://github.com/unjs/h3) event handler. Loader functions and actions similar to remix.

## How does it work?

Numix places all the code inside `<script>` in a nitro virtual module and simulates the corresponding endpoint. Numix will then make sure to run your loader on the server and for client side navigations it fetches the data required by the page.

This enables us to import a database or any other stuff that should never reach the client directly inside your Nuxt pages.

## Quick Start

1. Install `numix`:

```bash
pnpm add numix
```

2. Add to the `modules` section of `nuxt.config.js`:

```ts
export default defineNuxtConfig({
  modules: ['numix'],
})
```

3. Use it

```vue
<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import type { Todo } from '@prisma/client'

export const loader = async () => {
  const result = await prisma.todo.findMany()
  return result
}
</script>

<script setup lang="ts">
const { data: todos } = await useLoaderData<Todo[]>()
</script>

<template>
  <ul v-if="data">
    <li v-for="t in todos" :key="t.id">
      {{ t.title }}
    </li>
  </ul>
</template>
```

Docs to

## License

MIT
