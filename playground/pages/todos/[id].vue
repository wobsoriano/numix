<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import type { Todo } from '@prisma/client'
import { redirect } from 'numix/server'

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
      {{ todo }}
    </div>
    <div v-else-if="error">
      {{ error.message }}
    </div>
    <div v-else>
      hmm
    </div>
  </div>
</template>
