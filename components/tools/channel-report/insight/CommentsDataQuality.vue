<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Data Quality</h2>
      <span :class="badgeClass(dataQualityTone(data.status))">{{ data.status }}</span>
    </div>
    <div v-if="data.issues?.length" class="space-y-2">
      <div v-for="(issue, i) in data.issues" :key="i" class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <span :class="badgeClass(severityTone(issue.severity))">{{ issue.severity }}</span>
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ issue.issue }}</p>
        </div>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ issue.impact }}</p>
        <p class="mt-1 text-xs font-medium text-purple-700 dark:text-purple-400">{{ issue.recommended_action }}</p>
      </div>
    </div>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">No data quality issues found.</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsDataQuality } from '~/composables/useChannelReportInsight'

defineProps<{ data: CommentsDataQuality }>()

const { badgeClass, dataQualityTone, severityTone } = useInsightBadge()
</script>
