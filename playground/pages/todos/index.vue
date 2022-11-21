<script lang="ts">
import type { LoaderFunction } from 'numix/composables'
import { readBody } from 'h3'
import { prisma } from '@/lib/prisma'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData() {
  const result = await prisma.todo.findMany()
  return result
}

export const loader: LoaderFunction = async () => {
  const result = await prisma.todo.findMany()
  return result
}

export const action = async (event) => {
  const body = await readBody(event)
  return {
    body,
  }
}
</script>

<script setup lang="ts">
import { Form } from 'numix/form'
const { data: todos } = await useLoaderData<LoaderData>()
const result = await useActionData<any>()
</script>

<template>
  <div class="container">
    <div v-if="result">
      {{ result }}
    </div>
    <div v-if="todos">
      <ul v-if="todos">
        <li v-for="t in todos" :key="t.id">
          <NuxtLink :to="`/todos/${t.id}`">
            {{ t.title }}
          </NuxtLink>
        </li>
      </ul>
      <Form action="/todos" method="post">
        <input type="text" name="title">
        <input type="text" name="content">
        <button>Submit</button>
      </Form>
    </div>
    <div v-else>
      No todos
    </div>
  </div>
</template>
