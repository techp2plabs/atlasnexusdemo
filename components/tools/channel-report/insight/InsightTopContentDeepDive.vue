<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Top Content Deep-Dive</h2>
    <div class="space-y-4">
      <div
        v-for="item in sorted"
        :key="item.rank"
        class="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
      >
        <div class="flex items-start gap-3">
          <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {{ item.rank }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.video_title }}</p>
            <div class="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ fmtNumber(item.views) }} views</span>
              <span v-if="item.engagement_rate_percent != null">{{ fmtPercent(item.engagement_rate_percent) }} engagement</span>
            </div>
            <p class="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">Hook: {{ item.hook_angle }}</p>
            <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">{{ item.core_ideation }}</p>
            <p class="mt-2 text-xs font-medium text-purple-700 dark:text-purple-400">{{ item.why_it_worked }}</p>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!items.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { TopContentDeepDiveItem } from '~/composables/useChannelReportInsight'

const props = defineProps<{ items: TopContentDeepDiveItem[] }>()

const { fmtNumber, fmtPercent } = useInsightFormat()

const sorted = computed(() => [...(props.items || [])].sort((a, b) => a.rank - b.rank))
</script>
