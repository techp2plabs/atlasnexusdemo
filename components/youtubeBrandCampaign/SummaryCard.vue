<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
    <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ label }}</p>
    <p class="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string | number
}

defineProps<Props>()
</script>
