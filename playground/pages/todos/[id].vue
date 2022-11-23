<script lang="ts">
import type { LoaderFunction } from 'numix/client'
import { prisma } from '~~/lib/prisma.server'
import { createError, setResponseHeader } from 'h3'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData(id: number) {
  const result = await prisma.todo.findFirstOrThrow({
    where: {
      id,
    },
  })
  return result
}

export const loader: LoaderFunction = async (event) => {
  const { params } = event
  try {
    const result = await getLoaderData(Number(params.id))
    return result
  }
  catch (error) {
    setResponseHeader(event, 'x-numix-redirect', '/todos')
    throw createError({
      statusCode: 404,
      statusMessage: 'not found',
    })
  }
}
</script>

<script setup lang="ts">
defineProps(['thanks'])

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
