<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import { useLoaderData } from '#imports'

export async function loader(event: LoaderEvent) {
  try {
    const result = await prisma.todo.findFirstOrThrow({
      where: {
        id: Number(event.params.id),
      },
    })
    return result
  }
  catch (error) {
    // return redirect(event, '/todos')
  }
}
</script>

<script setup lang="ts">
const { data: todo, error } = await useLoaderData<typeof loader>()
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
