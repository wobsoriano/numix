<script lang="ts">
import { createError, readBody } from 'h3'
import type { Todo } from '@prisma/client'
import { redirect } from '../../../src/runtime/server'
import { prisma } from '~~/lib/prisma.server'
import { useActionData } from '#imports'

export async function action(event: ActionEvent) {
  const body = await readBody(event) as Pick<Todo, 'title' | 'content'>

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Form error',
    })
  }

  await prisma.todo.create({
    data: {
      title: body.title,
      content: body.content,
      completed: false,
    },
  })

  return redirect(event, '/todos')
}
</script>

<script setup lang="ts">
const { pending } = await useActionData<typeof action>()
</script>

<template>
  <Form method="post" action="/todos">
    <input type="text" name="title">
    <input type="text" name="content">
    <button :disabled="pending">
      Submit
    </button>
  </Form>
</template>
