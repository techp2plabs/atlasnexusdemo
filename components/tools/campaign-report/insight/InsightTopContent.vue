<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Top Performing Content</h2>

    <div v-if="data.top_by_views?.length" class="mb-6">
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Top by Views</h3>
      <div class="space-y-2">
        <div v-for="v in data.top_by_views" :key="v.rank" class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {{ v.rank }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ v.video_title }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ v.channel }}</p>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ v.reason }}</p>
          </div>
          <div class="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
            <p class="font-semibold text-gray-900 dark:text-white">{{ fmtNumber(v.views) }} views</p>
            <p>{{ fmtPercent(v.view_contribution_percent) }} share</p>
            <p>{{ fmtPercent(v.engagement_rate_percent) }} eng.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.top_by_engagement_efficiency?.length" class="mb-6">
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Top by Engagement Efficiency</h3>
      <div class="space-y-2">
        <div v-for="v in data.top_by_engagement_efficiency" :key="v.rank" class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {{ v.rank }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ v.video_title }}</p>
              <span :class="badgeClass(classificationTone(v.classification))">{{ v.classification }}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ v.channel }}</p>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ v.reason }}</p>
          </div>
          <div class="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
            <p class="font-semibold text-gray-900 dark:text-white">{{ fmtNumber(v.views) }} views</p>
            <p>{{ fmtPercent(v.engagement_rate_percent) }} eng.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.underperforming_content?.length">
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Underperforming Content</h3>
      <div class="space-y-2">
        <div v-for="(v, i) in data.underperforming_content" :key="i" class="rounded-lg border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/10">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ v.video_title }}</p>
            <span class="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">{{ fmtNumber(v.views) }} views · {{ fmtPercent(v.engagement_rate_percent) }}</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ v.channel }}</p>
          <p class="mt-1 text-xs text-gray-700 dark:text-gray-300">{{ v.diagnosis }}</p>
        </div>
      </div>
    </div>

    <p v-if="!data.top_by_views?.length && !data.top_by_engagement_efficiency?.length && !data.underperforming_content?.length" class="text-sm text-gray-400 dark:text-gray-600">
      Not available
    </p>
  </div>
</template>

<script setup lang="ts">
import type { InsightTopContent } from '~/composables/useCampaignReportInsight'

defineProps<{ data: InsightTopContent }>()

const { fmtNumber, fmtPercent } = useInsightFormat()
const { badgeClass, classificationTone } = useInsightBadge()
</script>
