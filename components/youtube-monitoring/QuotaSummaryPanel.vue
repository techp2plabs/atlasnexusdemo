<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <p v-if="periodLabel" class="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ periodLabel }}</p>
    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Units Used</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ summary.consumed.toLocaleString() }}</p>
      </div>
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Remaining</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ summary.remaining.toLocaleString() }}</p>
      </div>
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
        <div class="mt-2 flex items-center gap-1.5">
          <span
            :class="[
              'inline-block h-2.5 w-2.5 rounded-full',
              summary.status === 'healthy' ? 'bg-green-500' : summary.status === 'warning' ? 'bg-amber-400' : 'bg-red-500',
            ]"
          />
          <span
            :class="[
              'text-sm font-semibold capitalize',
              summary.status === 'healthy' ? 'text-green-700 dark:text-green-400' : summary.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-700 dark:text-red-400',
            ]"
          >{{ summary.status }}</span>
        </div>
      </div>
    </div>
    <div class="mt-4">
      <div class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{{ summary.percent_used.toFixed(1) }}% of {{ summary.limit.toLocaleString() }} daily limit</span>
        <span>{{ summary.consumed.toLocaleString() }} / {{ summary.limit.toLocaleString() }}</span>
      </div>
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          :class="[
            'h-2.5 rounded-full transition-all duration-500',
            summary.status === 'healthy' ? 'bg-green-500' : summary.status === 'warning' ? 'bg-amber-400' : 'bg-red-500',
          ]"
          :style="{ width: `${Math.min(summary.percent_used, 100)}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuotaSummary } from '~/composables/useYoutubeMonitoring'

defineProps<{ summary: QuotaSummary; periodLabel?: string }>()
</script>
