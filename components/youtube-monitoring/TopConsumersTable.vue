<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ title }}</h3>
    <div v-if="!consumers.length" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
      No API calls recorded for this period
    </div>
    <div v-else class="space-y-4">
      <div v-for="row in consumers" :key="row.module">
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="font-medium text-gray-800 dark:text-gray-200">{{ row.label }}</span>
          <span class="text-gray-500 dark:text-gray-400">{{ row.units.toLocaleString() }} <span class="text-xs">({{ row.share_pct.toFixed(1) }}%)</span></span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-2 rounded-full bg-brand-500"
            :style="{ width: `${Math.min(row.share_pct, 100)}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopConsumerRow } from '~/composables/useYoutubeMonitoring'

withDefaults(defineProps<{ consumers: TopConsumerRow[]; title?: string }>(), { title: 'Top Consumers' })
</script>
