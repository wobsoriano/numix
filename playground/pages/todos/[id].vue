<script lang="ts">
import type { LoaderFunction } from 'numix/composables'
import { prisma } from '@/lib/prisma'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData(id: number) {
  const result = await prisma.todo.findFirstOrThrow({
    where: {
      id,
    },
  })
  return result
}

export const loader: LoaderFunction = async (e) => {
  const result = await getLoaderData(Number(e.params.id))
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
