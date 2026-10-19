<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Growth Plan</h2>

    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Content Ideas</p>
      <div class="space-y-2">
        <div
          v-for="(idea, i) in data.content_ideas"
          :key="i"
          class="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
        >
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ idea.working_title }}</p>
          <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">Hook: {{ idea.hook_angle }}</p>
          <p class="mt-1 text-xs text-purple-700 dark:text-purple-400">Thumbnail concept: {{ idea.thumbnail_visual_concept }}</p>
        </div>
      </div>
      <p v-if="!data.content_ideas?.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
    </div>

    <div class="mt-5">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Execution Checklist</p>
      <div class="space-y-2">
        <div
          v-for="(item, i) in data.execution_checklist"
          :key="i"
          class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800"
        >
          <span :class="badgeClass(priorityTone(item.priority))">{{ item.priority }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.action }}</p>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{{ item.reason }}</p>
          </div>
        </div>
      </div>
      <p v-if="!data.execution_checklist?.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GrowthPlan } from '~/composables/useChannelReportInsight'

defineProps<{ data: GrowthPlan }>()

const { badgeClass, priorityTone } = useInsightBadge()
</script>
