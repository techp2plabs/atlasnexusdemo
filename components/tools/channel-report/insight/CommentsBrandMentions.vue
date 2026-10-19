<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white">Brand &amp; Campaign Mentions</h2>
      <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {{ data.mention_volume?.count ?? 0 }} mentions ({{ fmtPercent(data.mention_volume?.pct_of_analyzed) }})
      </span>
    </div>
    <div v-if="data.top_associations?.length" class="space-y-2">
      <div v-for="(a, i) in data.top_associations" :key="i" class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm text-gray-800 dark:text-gray-200">"{{ a.phrase }}"</p>
          <span :class="badgeClass(sentimentTone(a.sentiment))">{{ a.sentiment }}</span>
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ a.context }}</p>
      </div>
    </div>
    <p v-else class="text-sm text-gray-400 dark:text-gray-600">No brand associations found</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsBrandMentions } from '~/composables/useChannelReportInsight'
import type { BadgeTone } from '~/composables/useInsightBadge'

defineProps<{ data: CommentsBrandMentions }>()

const { badgeClass } = useInsightBadge()
const { fmtPercent } = useInsightFormat()

const sentimentTone = (sentiment: string): BadgeTone => {
  switch (sentiment) {
    case 'positive': return 'green'
    case 'negative': return 'red'
    default: return 'gray'
  }
}
</script>
