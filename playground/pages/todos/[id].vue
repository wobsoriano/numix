<script lang="ts">
import type { Todo } from '@prisma/client'
import { redirect } from 'numix/server'
import { prisma } from '~~/lib/prisma.server'
import { useLoaderData } from '#imports'

export const loader: LoaderFunction = async (event) => {
  try {
    const result = await prisma.todo.findFirstOrThrow({
      where: {
        id: Number(event.params.id),
      },
    })
    return result
  }
  catch (error) {
    return redirect(event, '/todos')
  }
}
</script>

<script setup lang="ts">
const { data: todo, error } = await useLoaderData<Todo>()
</script>

<template>
  <div class="container">
    <div v-if="todo">
      Data: {{ todo }}
    </div>
    <div v-else-if="error">
      {{ error.message }}
    </div>
    <div v-else>
      hmm
    </div>
  </div>
</template>
