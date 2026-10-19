<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Channel Insights</h2>
    <div class="space-y-3">
      <div v-for="(c, i) in items" :key="i" class="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ c.channel }}</p>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ fmtNumber(c.campaign_views) }} views</span>
        </div>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            class="h-full rounded-full bg-purple-500"
            :style="{ width: `${Math.min(c.view_contribution_percent ?? 0, 100)}%` }"
          ></div>
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ fmtPercent(c.view_contribution_percent) }} of campaign views
          <span v-if="c.subscriber_count != null"> · {{ fmtNumber(c.subscriber_count) }} subscribers</span>
        </p>
        <p class="mt-2 text-xs text-gray-700 dark:text-gray-300">{{ c.insight }}</p>
      </div>
    </div>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { InsightChannelInsight } from '~/composables/useCampaignReportInsight'

defineProps<{ items: InsightChannelInsight[] }>()

const { fmtNumber, fmtPercent } = useInsightFormat()
</script>
