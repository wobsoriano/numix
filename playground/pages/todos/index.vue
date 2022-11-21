<script lang="ts">
import type { LoaderFunction } from 'numix/composables'
import { createError, readBody } from 'h3'
import { prisma } from '@/lib/prisma'

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>

async function getLoaderData() {
  const result = await prisma.todo.findMany()
  return result
}

const isAuthenticated = false

export const loader: LoaderFunction = async (e) => {
  const result = await prisma.todo.findMany()
  return result
}

export const action = async (event: any) => {
  const body = await readBody(event) as {
    title: string
    content: string
  }

  if (!body.title) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Incomplete',
    })
  }

  return {
    body,
  }
}
</script>

<script setup lang="ts">
import { Form } from 'numix/form'
const { data: todos, error } = await useLoaderData<LoaderData>()
const result = await useActionData<any>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="container">
    <div v-if="error">
      {{ error.statusMessage }}
      <button @click="handleError">handle error</button>
    </div>
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
