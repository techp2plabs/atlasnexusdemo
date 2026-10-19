<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">SEO &amp; Metadata Health</h2>
    <p class="text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.structural_alignment) }}</p>
    <div v-if="data.gaps_and_opportunities?.length" class="mt-4 space-y-2">
      <div
        v-for="(gap, i) in data.gaps_and_opportunities"
        :key="i"
        class="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
      >
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ gap.issue }}</p>
        <p class="mt-1 text-xs font-medium text-purple-700 dark:text-purple-400">{{ gap.recommended_action }}</p>
      </div>
    </div>
    <p v-else class="mt-3 text-sm text-gray-400 dark:text-gray-600">No SEO gaps identified</p>
  </div>
</template>

<script setup lang="ts">
import type { SeoMetadataHealth } from '~/composables/useChannelReportInsight'

defineProps<{ data: SeoMetadataHealth }>()

const { fmtText } = useInsightFormat()
</script>
