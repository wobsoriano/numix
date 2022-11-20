# Numix

## TODO

```vue
<script lang="ts">
import { prisma } from '@/lib/prisma'

export const loader = async () => {
  const result = await prisma.todo.findMany()
  return result
}
</script>

<script setup lang="ts">
const { data: todos } = await useLoaderData()
</script>

<template>
  <div class="container">
    <ul v-if="todos">
      <li v-for="t in todos" :key="t.id">
        {{ t.title }}
      </li>
    </ul>
    <div v-else>
      No todos
    </div>
    hey
  </div>
</template>
```
