<script lang="ts">
import { createError, readFormData } from 'h3'
import type { Todo } from '@prisma/client'
import { prisma } from '~~/lib/prisma.server'
import { useActionData, useLoaderData } from '#imports'

export async function loader() {
  const result = await prisma.todo.findMany()
  return result
}

export async function action(event: ActionEvent) {
  const formData = await readFormData(event)
  const body = {
    title: formData.get('title'),
    content: formData.get('content'),
  } as Todo

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
const { data: todos } = await useLoaderData<typeof loader>()
const { pending } = await useActionData<typeof action>()
</script>

<template>
  <div class="container">
    <div v-if="todos">
      <h1>Todos</h1>
      <ul v-if="todos">
        <li
          v-for="t in todos"
          :key="t.id"
        >
          <NuxtLink :to="`/todos/${t.id}`">
            {{ t.title }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/todos/user">
            Users
          </NuxtLink>
        </li>
      </ul>
      <Form
        method="POST"
        action="/todos"
      >
        <input
          type="text"
          name="title"
        >
        <input
          type="text"
          name="content"
        >
        <button :disabled="pending">
          Submit
        </button>
      </Form>
      <NuxtLink to="/todos/add">
        Go to add todo
      </NuxtLink>
    </div>
    <div v-else>
      No todos
    </div>
  </div>
</template>
