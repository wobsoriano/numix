# Numix

Add [remix](https://remix.run/)-like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes) to your Nuxt page components.

## What is Numix?

Numix provides you with server side scripts inside your Nuxt pages, which will be transformed to a [h3](https://github.com/unjs/h3) server handler. Loader functions and actions similar to remix.

## How does it work?

TODO

## Quick Start

1. Install `numix`:

```bash
pnpm add numix
```

2. Add to the `modules` seciton of `nuxt.config.js`:

```ts
export default defineNuxtConfig({
  modules: ['numix'],
})
```

3. Use it

```vue
<script lang="ts">
import { prisma } from '@/lib/prisma.server'
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

## License MIT
