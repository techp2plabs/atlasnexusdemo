<template>
  <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Views Over Time</h3>
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent" />
    </div>
    <div v-else-if="!series.length || !series[0].data.length" class="flex h-64 items-center justify-center text-sm text-gray-400">
      No data available
    </div>
    <apexchart
      v-else
      type="area"
      height="260"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DailyDataPoint } from '~/composables/useAnalytics'

const chartTokens = useChartTokens()

const props = defineProps<{
  timeseries: DailyDataPoint[]
  loading: boolean
  dateRange: number
}>()

const series = computed(() => [
  {
    name: 'Views',
    data: props.timeseries.map((d) => ({ x: d.date, y: d.views })),
  },
])

const chartOptions = computed(() => ({
  chart: {
    id: 'views-timeseries',
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: chartTokens.value.font, foreColor: chartTokens.value.text,
  },
  colors: [chartTokens.value.accent],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'datetime',
    labels: { style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { fontSize: '11px' },
      formatter: (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
        return String(v)
      },
    },
  },
  tooltip: {
    x: { format: 'dd MMM yyyy' },
    y: {
      formatter: (v: number) => `${v.toLocaleString()} views`,
    },
  },
  grid: {
    borderColor: chartTokens.value.border,
    strokeDashArray: 4,
  },
  theme: { mode: chartTokens.value.dark ? 'dark' : 'light' },
}))
</script>
