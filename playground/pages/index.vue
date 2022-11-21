<script setup lang="ts">
await useAsyncData(() => $fetch('https://jsonplaceholder.typicode.com/todos/1'))
</script>

<template>
  <div class="container">
    <NuxtLink to="/todos">
      Go to Todos
    </NuxtLink>
  </div>
</template>
