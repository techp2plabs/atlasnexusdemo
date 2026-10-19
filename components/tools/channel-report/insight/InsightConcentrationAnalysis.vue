<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Concentration Analysis</h2>
      <span :class="badgeClass(concentrationTone(data.assessment))">{{ data.assessment }}</span>
    </div>

    <div class="space-y-4">
      <div v-for="bar in bars" :key="bar.label">
        <div class="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{{ bar.label }}</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ fmtPercent(bar.value) }}</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div class="h-full rounded-full bg-purple-500" :style="{ width: `${Math.min(bar.value ?? 0, 100)}%` }"></div>
        </div>
      </div>
    </div>

    <p class="mt-4 text-sm text-gray-700 dark:text-gray-300">{{ data.implication }}</p>
  </div>
</template>

<script setup lang="ts">
import type { InsightConcentrationAnalysis } from '~/composables/useChannelReportInsight'

const props = defineProps<{ data: InsightConcentrationAnalysis }>()

const { fmtPercent } = useInsightFormat()
const { badgeClass, concentrationTone } = useInsightBadge()

const bars = computed(() => [
  { label: 'Top 5 videos', value: props.data.top_5_video_view_share_percent },
  { label: 'Top 10 videos', value: props.data.top_10_video_view_share_percent },
  { label: 'Top channel', value: props.data.top_channel_view_share_percent },
])
</script>
