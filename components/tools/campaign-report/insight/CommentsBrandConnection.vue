<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Brand Connection & Relevance</h2>
      <span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
        {{ fmtPercent(data.brand_connection_ratio_pct) }} connected
      </span>
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-green-700 dark:text-green-400">{{ fmtPercent(data.breakdown?.directly_connected_pct) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Directly Connected</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-blue-700 dark:text-blue-400">{{ fmtPercent(data.breakdown?.contextually_relevant_pct) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Contextually Relevant</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">{{ fmtPercent(data.breakdown?.unconnected_noise_pct) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Unconnected / Noise</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.narrative) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsBrandConnection } from '~/composables/useCampaignReportInsight'

defineProps<{ data: CommentsBrandConnection }>()

const { fmtPercent, fmtText } = useInsightFormat()
</script>
