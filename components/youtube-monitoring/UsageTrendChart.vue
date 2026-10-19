<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{{ title }}</h3>
    <div v-if="isEmpty" class="flex h-48 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
      No API calls recorded for this period
    </div>
    <apexchart
      v-else
      type="bar"
      height="200"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuotaTrendBucket, Granularity } from '~/composables/useYoutubeMonitoring'

const props = withDefaults(
  defineProps<{ trend: QuotaTrendBucket[]; granularity?: Granularity; title?: string }>(),
  { granularity: 'hourly', title: 'Usage Trend' }
)

const isEmpty = computed(() => props.trend.every((b) => b.units === 0))

// bucket labels from the backend are local wall-clock strings ("2026-07-02T09:00:00"
// or "2026-07-02") already resolved to the viewer's timezone — parse as local, not UTC.
function parseLocal(bucket: string): number {
  if (bucket.length === 10) {
    const [y, m, d] = bucket.split('-').map(Number)
    return new Date(y, m - 1, d).getTime()
  }
  const [datePart, timePart] = bucket.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [h, min, s] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, h, min, s).getTime()
}

function formatLabel(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return props.granularity === 'hourly'
    ? `${pad(d.getHours())}:${pad(d.getMinutes())}`
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// bar charts render mislabeled/duplicated ticks when paired with xaxis type
// "datetime" (each bar is a discrete category, not a point on a continuous
// time scale), so use a categorical axis with pre-formatted string labels.
const categories = computed(() => props.trend.map((b) => formatLabel(parseLocal(b.hour))))

const series = computed(() => [
  {
    name: 'Quota Units',
    data: props.trend.map((b) => b.units),
  },
])

const chartOptions = computed(() => ({
  chart: {
    id: 'usage-quota-trend',
    type: 'bar',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'inherit',
  },
  colors: ['#7c3aed'],
  plotOptions: {
    bar: { borderRadius: 3, columnWidth: '60%' },
  },
  dataLabels: {
    enabled: true,
    formatter: (v: number) => v.toLocaleString(),
    offsetY: -18,
    style: { fontSize: '10px', colors: ['#374151'] },
  },
  xaxis: {
    type: 'category',
    categories: categories.value,
    labels: {
      style: { fontSize: '11px' },
      rotate: props.granularity === 'hourly' ? -45 : 0,
      hideOverlappingLabels: true,
      trim: false,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tickPlacement: 'on',
  },
  yaxis: {
    labels: {
      style: { fontSize: '11px' },
      formatter: (v: number) => String(Math.round(v)),
    },
    min: 0,
  },
  tooltip: {
    y: { formatter: (v: number) => `${v.toLocaleString()} units` },
  },
  grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
  theme: { mode: 'light' },
}))
</script>
