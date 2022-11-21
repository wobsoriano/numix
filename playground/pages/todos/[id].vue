<script lang="ts">
import type { LoaderFunction } from 'numix/composables'
import { prisma } from '@/lib/prisma'
import { createError } from 'h3'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData(id: number) {
  try {
    const result = await prisma.todo.findFirstOrThrow({
      where: {
        id,
      },
    })
    return result
  }
  catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'not found',
    })
  }
}

export const loader: LoaderFunction = async (event) => {
  const { params } = event
  const result = await getLoaderData(Number(params.id))
  return result
}
</script>

<script setup lang="ts">
const { data: todo, error } = await useLoaderData<LoaderData>()
</script>

<template>
  <div class="container">
    <div v-if="todo">
      {{ todo }}
    </div>
    <div v-else-if="error">
      {{ error.statusMessage }}
    </div>
    <div v-else>
      hmm
    </div>
  </div>
</template>
