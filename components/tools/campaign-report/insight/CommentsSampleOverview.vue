<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Sample Overview</h2>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ fmtNumber(data.total_comments_in_report) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Total in report</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-purple-700 dark:text-purple-400">{{ fmtNumber(data.total_comments_analyzed) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Analyzed</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">{{ fmtNumber(data.creator_replies_excluded) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Creator replies excluded</p>
      </div>
      <div class="rounded-lg border border-gray-100 p-3 text-center dark:border-gray-800">
        <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">{{ fmtNumber(data.spam_or_irrelevant_excluded) }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Spam/irrelevant excluded</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(data.coverage_note) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsSampleOverview } from '~/composables/useCampaignReportInsight'

defineProps<{ data: CommentsSampleOverview }>()

const { fmtNumber, fmtText } = useInsightFormat()
</script>
