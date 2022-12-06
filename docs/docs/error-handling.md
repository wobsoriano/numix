# Error Handling

Both `useLoaderData` and `useActionData` result contains an `error` object similar to `useAsyncData/useFetch`:

```vue
<script setup>
const { data, error } = await useLoaderData()
</script>

<template>
  <div>
    <ProductList v-if="data" />
    <SomeErrorComponent v-else-if="error" :error="error" />
  </div>
</template>
```

You can also use the [`<NuxtErrorBoundary>`](https://nuxt.com/docs/api/components/nuxt-error-boundary#nuxterrorboundary) component provided by Nuxt.

More info regarding Nuxt error handling [here](https://nuxt.com/docs/getting-started/error-handling#error-handling).
