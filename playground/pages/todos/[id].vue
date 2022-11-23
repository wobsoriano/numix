<script lang="ts">
import type { LoaderFunction } from 'numix/client'
import { prisma } from '~~/lib/prisma.server'
import { createError, setResponseHeader } from 'h3'
import type { Todo } from '@prisma/client'

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const result = await prisma.todo.findFirstOrThrow({
      where: {
        id: Number(params.id),
      },
    })
    return result
  }
  catch (error) {
    // setResponseHeader(event, 'x-numix-redirect', '/todos')
    throw createError({
      statusCode: 404,
      statusMessage: 'not found',
    })
  }
}
</script>

<script setup lang="ts">
import { useLoaderData } from 'numix/client'
defineProps(['thanks'])

const { data: todo, error } = await useLoaderData<Todo>()
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
