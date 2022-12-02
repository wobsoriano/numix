<script lang="ts">
import { createError, readBody } from 'h3'
import { redirect } from 'numix/server'
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
      statusCode: 400,
      statusMessage: 'Form error',
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
const { data: todos } = await useLoaderData<Todo[]>()
// const result = await useActionData<Todo>()
</script>

<template>
  <div class="container">
    <div v-if="todos">
      <h1>Todos</h1>
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
        <li>
          <NuxtLink to="/hello">
            hello
          </NuxtLink>
        </li>
      </ul>
      <Form method="post" action="/todos">
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
