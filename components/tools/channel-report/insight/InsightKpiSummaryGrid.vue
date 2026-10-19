<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">KPI Summary</h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="(kpi, i) in items" :key="i" class="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ kpi.metric }}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ kpi.value ?? 'Not available' }}</p>
        <p class="mt-2 text-xs text-gray-600 dark:text-gray-400">{{ kpi.interpretation }}</p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Target: {{ kpi.target_comparison || 'Not provided' }}</p>
      </div>
    </div>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { InsightKpiSummaryItem } from '~/composables/useChannelReportInsight'

defineProps<{ items: InsightKpiSummaryItem[] }>()
</script>
