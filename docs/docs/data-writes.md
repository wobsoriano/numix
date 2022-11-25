# Data Writes

Each `.vue` page can also define an action function. This `action` gets called on submit by the Numix `Form` component and numix automatically invalidates the data of your current page. `useActionData` will return the data from the action.

```vue
<script lang="ts">
import { prisma } from '~~/lib/prisma.server'
import type { Product } from '@prisma/client'

export const action: ActionFunction = async (event) => {
  const body = await readBody(event)
  const result = await prisma.product.create({
    data: {
      name: body.name,
      price: body.price
    }
  })
  return result
}
</script>

<script setup lang="ts">
import { Form, useActionData } from 'numix/client'
const { data } = await useActionData<Product>()
</script>

<template>
  <Form method="post">
    <input type="text" name="name">
    <input type="number" name="price">
    <button>Submit</button>
  </Form>
</template>
```