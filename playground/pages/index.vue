<script lang="ts">
export const loader = async () => {
  const todos = await $fetch('https://jsonplaceholder.typicode.com/todos')
  return todos
}
</script>

<script setup lang="ts">
// const { data } = await useLoaderData()
</script>

<template>
  <div>hello from index</div>
</template>
