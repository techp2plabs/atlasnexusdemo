<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Audience Preferences</h2>
    <div class="space-y-4">
      <div
        v-for="(trigger, i) in data.top_performing_triggers"
        :key="i"
        class="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
      >
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ trigger.pattern }}</p>
        <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">{{ trigger.evidence }}</p>
        <p class="mt-2 text-xs font-medium text-purple-700 dark:text-purple-400">{{ trigger.psychological_driver }}</p>
      </div>
    </div>
    <p v-if="!data.top_performing_triggers?.length" class="text-sm text-gray-400 dark:text-gray-600">Not available</p>
  </div>
</template>

<script setup lang="ts">
import type { AudiencePreferences } from '~/composables/useChannelReportInsight'

defineProps<{ data: AudiencePreferences }>()
</script>
