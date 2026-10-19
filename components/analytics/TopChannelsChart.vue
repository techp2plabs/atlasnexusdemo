<template>
  <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 10 Channels</h3>
      <div class="flex rounded-lg border border-border dark:border-gray-700 text-xs overflow-hidden">
        <button
          :class="['px-3 py-1.5 transition-colors', sortBy === 'views' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800']"
          @click="$emit('update:sortBy', 'views')"
        >Views</button>
        <button
          :class="['px-3 py-1.5 transition-colors', sortBy === 'revenue' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800']"
          @click="$emit('update:sortBy', 'revenue')"
        >Est. Revenue</button>
      </div>
    </div>

    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent" />
    </div>
    <div v-else-if="!series.length || !series[0].data.length" class="flex h-64 items-center justify-center text-sm text-gray-400">
      No channel data available
    </div>
    <apexchart
      v-else
      type="bar"
      height="260"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TopChannelItem } from '~/composables/useAnalytics'

const chartTokens = useChartTokens()

const props = defineProps<{
  channels: TopChannelItem[]
  loading: boolean
  sortBy: 'views' | 'revenue'
}>()

defineEmits<{ (e: 'update:sortBy', val: 'views' | 'revenue'): void }>()

const truncate = (s: string, max = 25) => (s.length > max ? s.slice(0, max) + '…' : s)

const series = computed(() => {
  const data = props.channels.map((ch) =>
    props.sortBy === 'revenue' ? (ch.estimated_revenue_usd ?? 0) : ch.views,
  )
  return [{ name: props.sortBy === 'revenue' ? 'Est. Revenue (USD)' : 'Views', data }]
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: chartTokens.value.font, foreColor: chartTokens.value.text,
  },
  plotOptions: {
    bar: { horizontal: true, borderRadius: 4, barHeight: '60%' },
  },
  colors: [chartTokens.value.accent],
  dataLabels: { enabled: false },
  xaxis: {
    categories: props.channels.map((ch) => truncate(ch.title)),
    labels: {
      style: { fontSize: '11px' },
      formatter: (v: number) => {
        if (props.sortBy === 'revenue') return `$${v.toLocaleString()}`
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
        return String(v)
      },
    },
  },
  yaxis: { labels: { style: { fontSize: '11px' } } },
  tooltip: {
    y: {
      formatter: (v: number) =>
        props.sortBy === 'revenue'
          ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          : `${v.toLocaleString()} views`,
    },
  },
  grid: { borderColor: chartTokens.value.border, strokeDashArray: 4 },
}))
</script>
