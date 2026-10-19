<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Content Patterns</h2>
    <div class="space-y-3">
      <div v-for="(p, i) in items" :key="i" class="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ p.pattern }}</p>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ p.evidence }}</p>
        <p class="mt-2 text-xs text-purple-700 dark:text-purple-400">{{ p.interpretation }}</p>
      </div>
    </div>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { InsightContentPattern } from '~/composables/useChannelReportInsight'

defineProps<{ items: InsightContentPattern[] }>()
</script>
