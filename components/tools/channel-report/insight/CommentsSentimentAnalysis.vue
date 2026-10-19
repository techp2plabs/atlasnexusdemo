<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Sentiment Analysis</h2>
    <div class="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div class="bg-green-500" :style="{ width: `${data.sentiment_split?.positive_pct ?? 0}%` }"></div>
      <div class="bg-gray-400" :style="{ width: `${data.sentiment_split?.neutral_pct ?? 0}%` }"></div>
      <div class="bg-red-500" :style="{ width: `${data.sentiment_split?.negative_pct ?? 0}%` }"></div>
    </div>
    <div class="mt-2 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
      <span>🟢 Positive {{ fmtPercent(data.sentiment_split?.positive_pct) }}</span>
      <span>⚪ Neutral {{ fmtPercent(data.sentiment_split?.neutral_pct) }}</span>
      <span>🔴 Negative {{ fmtPercent(data.sentiment_split?.negative_pct) }}</span>
    </div>

    <p class="mt-4 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.narrative) }}</p>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <p class="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">Positive drivers</p>
        <ul class="space-y-1">
          <li v-for="(d, i) in data.key_drivers?.positive ?? []" :key="i" class="text-xs text-gray-600 dark:text-gray-400">• {{ d }}</li>
        </ul>
      </div>
      <div>
        <p class="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-400">Neutral drivers</p>
        <ul class="space-y-1">
          <li v-for="(d, i) in data.key_drivers?.neutral ?? []" :key="i" class="text-xs text-gray-600 dark:text-gray-400">• {{ d }}</li>
        </ul>
      </div>
      <div>
        <p class="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">Negative drivers</p>
        <ul class="space-y-1">
          <li v-for="(d, i) in data.key_drivers?.negative ?? []" :key="i" class="text-xs text-gray-600 dark:text-gray-400">• {{ d }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommentsSentimentAnalysis } from '~/composables/useChannelReportInsight'

defineProps<{ data: CommentsSentimentAnalysis }>()

const { fmtPercent, fmtText } = useInsightFormat()
</script>
