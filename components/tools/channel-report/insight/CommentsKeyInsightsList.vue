<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Key Insights</h2>
    <div class="space-y-4">
      <div v-for="(insight, i) in items" :key="i" class="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        <div class="flex items-start gap-3">
          <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {{ i + 1 }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ insight.title }}</p>
            <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">{{ insight.finding }}</p>
            <ul v-if="insight.evidence?.length" class="mt-2 space-y-1">
              <li v-for="(ev, j) in insight.evidence" :key="j" class="text-xs text-gray-500 dark:text-gray-400">
                • {{ ev }}
              </li>
            </ul>
            <p class="mt-2 text-xs font-medium text-purple-700 dark:text-purple-400">{{ insight.implication }}</p>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { CommentsKeyInsight } from '~/composables/useChannelReportInsight'

defineProps<{ items: CommentsKeyInsight[] }>()
</script>
