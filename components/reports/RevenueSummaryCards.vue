<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
    <div
      v-for="card in cards"
      :key="card.label"
      class="rounded-lg border border-border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ card.label }}
          </div>
          <div class="mt-1 text-xl font-semibold text-foreground dark:text-white">
            {{ formatUsd(card.value) }}
          </div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400" :title="card.hint">
          i
        </div>
      </div>
      <div v-if="card.sub" class="mt-2 text-xs text-gray-600 dark:text-gray-400">
        {{ card.sub }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  summary: {
    gross_total_usd: number
    channel_total_usd: number
    mcn_total_usd: number
    organization_total_usd: number
    platform_total_usd: number
  } | null
}>()

const formatUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number.isFinite(n) ? n : 0,
  )

const cards = computed(() => {
  const s = props.summary
  return [
    {
      label: 'Gross (USD)',
      value: s?.gross_total_usd ?? 0,
      hint: 'Gross = Ads + Subscriptions + Shorts for selected month',
    },
    {
      label: 'Channel',
      value: s?.channel_total_usd ?? 0,
      hint: 'From stored monthly split snapshots',
    },
    {
      label: 'MCN',
      value: s?.mcn_total_usd ?? 0,
      hint: 'From stored monthly split snapshots',
    },
    {
      label: 'Organization',
      value: s?.organization_total_usd ?? 0,
      hint: 'From stored monthly split snapshots',
    },
    {
      label: 'Platform',
      value: s?.platform_total_usd ?? 0,
      hint: 'From stored monthly split snapshots',
    },
  ]
})
</script>

