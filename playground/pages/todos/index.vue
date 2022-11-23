<script lang="ts">
import { createError, readBody, setHeader } from 'h3'
import { prisma } from '~~/lib/prisma.server'
import type { Todo } from '@prisma/client'

export const loader: LoaderFunction = async (event) => {
  const result = await prisma.todo.findMany()
  return result
}

export const action: ActionFunction = async (event) => {
  const body = await readBody(event) as Pick<Todo, 'title' | 'content'>

  if (!body.title) {
    setHeader(event, 'x-numix-redirect', '/')
    throw createError({
      statusCode: 401,
      statusMessage: 'Incomplete',
    })
  }

  const result = await prisma.todo.create({
    data: {
      title: body.title,
      content: body.content,
      completed: false,
    },
  })

  return result
}
</script>

<script setup lang="ts">
import { Form, useActionData, useLoaderData } from 'numix/client'
const { data: todos, error, refresh } = await useLoaderData<Todo[]>()
const result = await useActionData<any>()

// watch(result.submitting, (val) => {
//   if (!val)
//     refresh()
// })
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
        <li>
          <NuxtLink to="/todos/21">
            404
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
