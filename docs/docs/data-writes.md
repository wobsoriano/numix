# Data Writes

Each `.vue` page can also define an action function. This `action` gets called on submit by the Numix `Form` component and numix automatically invalidates the data of your current page. `useActionData` will return the data from the action.

```vue
<script lang="ts">
import type { Product } from '@prisma/client'
import { prisma } from '@/lib/prisma.server'

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
const { data, submitting } = await useActionData<Product>()
</script>

<template>
  <Form method="post">
    <input type="text" name="name">
    <input type="number" name="price">
    <button :disabled="submitting">
      Submit
    </button>
  </Form>
</template>
```
