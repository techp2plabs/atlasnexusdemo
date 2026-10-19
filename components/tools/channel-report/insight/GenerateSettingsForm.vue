<template>
  <div class="space-y-3">
    <div>
      <p class="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Output Language</p>
      <div class="flex gap-2">
        <button
          v-for="opt in INSIGHT_LANGUAGE_OPTIONS"
          :key="opt.value"
          type="button"
          @click="$emit('update:language', opt.value)"
          :class="[
            'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            language === opt.value
              ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/20 dark:text-purple-300'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div>
      <p class="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Model</p>
      <div
        class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        {{ INSIGHT_MODEL_OPTIONS[0].label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  INSIGHT_LANGUAGE_OPTIONS,
  INSIGHT_MODEL_OPTIONS,
  type InsightLanguage,
  type InsightModel,
} from '~/composables/useChannelReportInsight'

defineProps<{ language: InsightLanguage; model: InsightModel }>()
defineEmits<{ 'update:language': [InsightLanguage] }>()
</script>
