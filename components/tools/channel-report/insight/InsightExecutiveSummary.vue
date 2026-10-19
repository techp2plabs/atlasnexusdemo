<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">Executive Summary</h2>
    <ul class="space-y-2">
      <li v-for="(item, i) in items" :key="i" class="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
        <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></span>
        <span>{{ item }}</span>
      </li>
    </ul>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>
