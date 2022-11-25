<script setup lang="ts">
function onError(err: any) {
  console.log('err', err)
}
</script>

<template>
  <div>
    <NuxtErrorBoundary @error="onError">
      <NuxtPage />
    </NuxtErrorBoundary>
  </div>
</template>
