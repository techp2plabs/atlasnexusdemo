<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Recommendations</h2>
    <div class="space-y-3">
      <div v-for="(r, i) in sorted" :key="i" class="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <span :class="badgeClass(priorityTone(r.priority))">{{ r.priority }}</span>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ r.action }}</p>
        </div>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ r.reason }}</p>
        <p class="mt-1 text-xs text-purple-700 dark:text-purple-400">{{ r.expected_impact }}</p>
        <span class="mt-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {{ r.owner }}
        </span>
      </div>
    </div>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { InsightRecommendation } from '~/composables/useChannelReportInsight'

const props = defineProps<{ items: InsightRecommendation[] }>()

const { badgeClass, priorityTone } = useInsightBadge()

const PRIORITY_ORDER: Record<string, number> = { P1: 0, P2: 1, P3: 2 }
const sorted = computed(() =>
  [...props.items].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99))
)
</script>
