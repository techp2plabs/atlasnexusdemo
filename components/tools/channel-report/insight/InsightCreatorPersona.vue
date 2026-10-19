<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">Creator &amp; Content Persona</h2>
    <div v-if="persona.content_pillars?.length" class="mb-4 flex flex-wrap gap-2">
      <span
        v-for="(pillar, i) in persona.content_pillars"
        :key="i"
        class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      >
        {{ pillar }}
      </span>
    </div>
    <div class="space-y-3">
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Tone &amp; Style</p>
        <p class="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(persona.tone_and_style) }}</p>
      </div>
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Positioning Summary</p>
        <p class="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{{ fmtText(persona.positioning_summary) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreatorPersona } from '~/composables/useChannelReportInsight'

defineProps<{ persona: CreatorPersona }>()

const { fmtText } = useInsightFormat()
</script>
