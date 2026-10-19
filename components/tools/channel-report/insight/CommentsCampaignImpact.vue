<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Campaign Impact &amp; Recommendations</h2>
      <span :class="badgeClass(confidenceTone(data.resonance_score))">Resonance: {{ data.resonance_score }}</span>
    </div>
    <p class="text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.resonance_rationale) }}</p>

    <div class="mt-4 space-y-3">
      <div v-for="(t, i) in data.key_marketing_takeaways" :key="i" class="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t.takeaway }}</p>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ t.rationale }}</p>
        <span class="mt-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {{ t.owner }}
        </span>
      </div>
    </div>
    <p v-if="!data.key_marketing_takeaways?.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsCampaignImpact } from '~/composables/useChannelReportInsight'

defineProps<{ data: CommentsCampaignImpact }>()

const { badgeClass, confidenceTone } = useInsightBadge()
const { fmtText } = useInsightFormat()
</script>
