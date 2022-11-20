<script lang="ts">
import type { LoaderFunction } from 'numix/composables'
import { prisma } from '@/lib/prisma'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData() {
  const result = await prisma.todo.findFirstOrThrow()
  return result
}

export const loader: LoaderFunction = async () => {
  const result = await getLoaderData()
  return result
}
</script>

<script setup lang="ts">
const { data: todo } = await useLoaderData<LoaderData>()
</script>

<template>
  <div class="container">
    <div v-if="todo">
      {{ todo }}
    </div>
  </div>
</template>
