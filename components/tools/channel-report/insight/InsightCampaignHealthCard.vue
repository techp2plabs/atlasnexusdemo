<template>
  <div class="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm dark:border-gray-800 dark:from-purple-950/20 dark:to-gray-900">
    <div class="flex flex-wrap items-center gap-2">
      <span :class="badgeClass(healthTone(health.status))">{{ health.status }}</span>
      <span :class="badgeClass(confidenceTone(health.confidence))">Confidence: {{ health.confidence }}</span>
      <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Period: {{ health.period_status }}
      </span>
    </div>
    <p class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{{ fmtText(health.headline) }}</p>
    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ fmtText(health.reason) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { InsightCampaignHealth } from '~/composables/useChannelReportInsight'

defineProps<{ health: InsightCampaignHealth }>()

const { badgeClass, healthTone, confidenceTone } = useInsightBadge()
const { fmtText } = useInsightFormat()
</script>
