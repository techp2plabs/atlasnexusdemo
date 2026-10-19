<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Upload Patterns</h2>
      <span :class="badgeClass(consistencyTone(data.consistency_assessment))">{{ data.consistency_assessment }}</span>
    </div>
    <div class="space-y-3">
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Cadence Summary</p>
        <p class="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.cadence_summary) }}</p>
      </div>
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Impact on Traffic</p>
        <p class="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.impact_on_traffic) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadPatterns } from '~/composables/useChannelReportInsight'
import type { BadgeTone } from '~/composables/useInsightBadge'

defineProps<{ data: UploadPatterns }>()

const { badgeClass } = useInsightBadge()
const { fmtText } = useInsightFormat()

const consistencyTone = (assessment: string): BadgeTone => {
  switch (assessment) {
    case 'Consistent': return 'green'
    case 'Irregular': return 'yellow'
    default: return 'gray'
  }
}
</script>
