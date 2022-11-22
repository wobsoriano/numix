<script lang="ts">
import { createError, readBody } from 'h3'
import { prisma } from '~~/lib/prisma.server'
import type { Todo } from '@prisma/client'

export const loader: LoaderFunction = async (event) => {
  const result = await prisma.todo.findMany()
  return result
}

export const action: ActionFunction = async (event) => {
  const body = await readBody(event) as Pick<Todo, 'title' | 'content'>

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
const { data: todos, error } = await useLoaderData<Todo[]>()
const result = await useActionData<any>()
</script>

<template>
  <div class="container">
    <div v-if="error">
      {{ error.statusMessage }}
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
      <Form method="post">
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
