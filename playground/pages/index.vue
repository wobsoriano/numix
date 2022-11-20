<script lang="ts">
import type { LoaderFunction } from 'numix/composables'
import { useLoaderData } from '#imports'
import { prisma } from '@/lib/prisma'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData() {
  const result = await prisma.todo.findMany()
  return result
}

export const loader: LoaderFunction = async () => {
  const result = await getLoaderData()
  return result
}
</script>

<script setup lang="ts">
const { data: todos } = await useLoaderData<LoaderData>()
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
