<template>
  <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Est. Revenue by MCN</h3>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent" />
    </div>
    <div
      v-else-if="!hasRevenue"
      class="flex h-64 flex-col items-center justify-center gap-2 text-center"
    >
      <svg class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-gray-400">Revenue data unavailable for this scope</p>
    </div>
    <apexchart
      v-else
      type="pie"
      height="260"
      :options="chartOptions"
      :series="series"
    />

    <p class="mt-3 text-xs text-gray-400 dark:text-gray-500">
      Calculated by Atlas by summing each channel's YouTube-reported estimated revenue, grouped by MCN —
      not an aggregation provided by YouTube's API services.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { McnRevenueItem } from '~/composables/useAnalytics'

const chartTokens = useChartTokens()

const props = defineProps<{
  breakdown: McnRevenueItem[]
  loading: boolean
}>()

const MAX_SLICES = 8

const hasRevenue = computed(() => props.breakdown.length > 0)

const displayItems = computed(() => {
  if (props.breakdown.length <= MAX_SLICES) return props.breakdown
  const top = props.breakdown.slice(0, MAX_SLICES - 1)
  const rest = props.breakdown.slice(MAX_SLICES - 1)
  const othersRev = rest.reduce((sum, m) => sum + m.estimated_revenue_usd, 0)
  return [...top, { mcn_id: 'others', mcn_name: 'Others', estimated_revenue_usd: othersRev }]
})

const series = computed(() => displayItems.value.map((m) => m.estimated_revenue_usd))

const chartOptions = computed(() => ({
  chart: { type: 'pie', toolbar: { show: false }, fontFamily: chartTokens.value.font, foreColor: chartTokens.value.text },
  labels: displayItems.value.map((m) => m.mcn_name),
  colors: [chartTokens.value.accent, '#2563eb', '#0f766e', '#b45309', '#a578d8', '#64748b', '#be185d', '#0284c7'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontSize: '11px' },
  tooltip: {
    y: {
      formatter: (v: number) =>
        `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
  },
}))
</script>
