<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Smart Metrics</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ fmtPercent(data.like_to_view_ratio_percent) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Like-to-view ratio</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ fmtPercent(data.comment_to_view_ratio_percent) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Comment-to-view ratio</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ fmtNumber(data.median_views) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Median views</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ fmtPercent(data.median_engagement_rate_percent) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Median engagement rate</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.engagement_depth_assessment) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { SmartMetrics } from '~/composables/useChannelReportInsight'

defineProps<{ data: SmartMetrics }>()

const { fmtNumber, fmtPercent, fmtText } = useInsightFormat()
</script>
