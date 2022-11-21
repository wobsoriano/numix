# Numix

Trying to add Remix loaders/actions in Nuxt.

## TODO

```vue
<script lang="ts">
import { prisma } from '@/lib/prisma'
import type { Todo } from '@prisma/client'
import type { LoaderFunction } from 'numix'

export const loader: LoaderFunction = async (event) => {
  const result = await prisma.todo.findMany()
  return result
}
</script>

<script setup lang="ts">
const { data: todos } = await useLoaderData<Todo>()
</script>

<template>
  <div>
    <ul v-if="todos">
      <li v-for="t in todos" :key="t.id">
        {{ t.title }}
      </li>
    </ul>
  </div>
</template>
```
