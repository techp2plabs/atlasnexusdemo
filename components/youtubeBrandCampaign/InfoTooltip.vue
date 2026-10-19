<template>
  <span v-if="entry" class="relative inline-flex" @mouseenter="open = true" @mouseleave="open = false">
    <button
      type="button"
      class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-gray-400 ring-1 ring-inset ring-gray-300 hover:text-gray-600 hover:ring-gray-400 dark:ring-gray-600 dark:hover:text-gray-300"
      :aria-label="`${entry.label} definition`"
      @focus="open = true"
      @blur="open = false"
      @click.stop
    >
      ⓘ
    </button>
    <div
      v-if="open"
      role="tooltip"
      class="absolute bottom-full left-1/2 z-50 mb-1.5 w-64 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <p class="text-xs font-semibold text-gray-800 dark:text-white/90">{{ entry.label }}</p>
      <p v-if="entry.formula && entry.formula !== 'UNRESOLVED'" class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
        {{ entry.formula }}
      </p>
      <p class="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">{{ entry.short_definition }}</p>
      <p class="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">{{ entry.data_source }}</p>
      <p
        v-if="entry.compliance_label"
        class="mt-1.5 border-t border-gray-100 pt-1.5 text-[10px] leading-snug text-gray-400 dark:border-gray-700"
      >
        {{ entry.compliance_label }}
      </p>
    </div>
  </span>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCampaignMeta, type MetricDefinition } from '~/composables/youtubeBrandCampaign/useCampaignMeta'

/**
 * Reads the *server* metric registry (`GET /api/v1/campaigns/meta/glossary`), the
 * single source of truth for every metric's label, formula and compliance label
 * (doc 05 §11). This component previously carried its own copy of the prototype's
 * dictionary, which could drift from the formula the backend actually applies —
 * exactly what the shared registry exists to prevent.
 */
interface Props {
  metricKey: string
}

const props = defineProps<Props>()
const open = ref(false)
const entry = ref<MetricDefinition | undefined>()

const { metric } = useCampaignMeta()

onMounted(async () => {
  try {
    entry.value = await metric(props.metricKey)
  } catch {
    entry.value = undefined
  }
})
</script>
