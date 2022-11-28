<script setup lang="ts">
import FormImpl from './FormImpl'

withDefaults(defineProps<{
  replace?: boolean
  onSubmit?: Function
}>(), {
  replace: false,
})
</script>

<template>
  <FormImpl :replace="replace" :on-submit="onSubmit">
    <slot />
  </FormImpl>
</template>
