<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <!-- Total Views -->
    <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Views</p>
      <div v-if="loading" class="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <p v-else class="mt-1 text-2xl font-bold text-foreground dark:text-white">
        {{ formatViews(summary?.total_views) }}
      </p>
      <p class="mt-1 text-xs text-gray-400">Last {{ dateRange }} days</p>
    </div>

    <!-- Watch Time -->
    <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Watch Time</p>
      <div v-if="loading" class="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <p v-else class="mt-1 text-2xl font-bold text-foreground dark:text-white">
        {{ formatWatchTime(summary?.total_watch_time_minutes) }}
      </p>
      <p class="mt-1 text-xs text-gray-400">Hours watched</p>
    </div>

    <!-- Subscribers Net -->
    <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Subscribers</p>
      <div v-if="loading" class="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <p v-else :class="['mt-1 text-2xl font-bold', subsNetClass]">
        {{ formatSubsNet(summary?.subscribers_gained, summary?.subscribers_lost) }}
      </p>
      <p class="mt-1 text-xs text-gray-400">Net gained / lost</p>
    </div>

    <!-- Estimated Revenue -->
    <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Est. Revenue
        <span
          v-if="!loading && summary?.estimated_revenue_usd == null"
          class="ml-1 cursor-help text-gray-400"
          title="Revenue data unavailable for this scope"
        >ⓘ</span>
      </p>
      <div v-if="loading" class="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <p v-else class="mt-1 text-2xl font-bold text-foreground dark:text-white">
        {{ formatRevenue(summary?.estimated_revenue_usd) }}
      </p>
      <p class="mt-1 text-xs text-gray-400">USD estimate</p>
    </div>

    <p class="col-span-2 mt-1 text-xs text-gray-400 dark:text-gray-500 lg:col-span-4">
      Est. Revenue is aggregated by Atlas from each channel's YouTube-reported estimated revenue across the
      selected scope — not a figure provided directly by YouTube's API services.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsSummary } from '~/composables/useAnalytics'

const props = defineProps<{
  summary: AnalyticsSummary | null
  loading: boolean
  dateRange: number
}>()

const formatViews = (v?: number | null) => {
  if (v == null) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString()
}

const formatWatchTime = (minutes?: number | null) => {
  if (minutes == null) return '—'
  const hours = Math.round(minutes / 60)
  if (hours >= 1_000_000) return `${(hours / 1_000_000).toFixed(1)}M hrs`
  if (hours >= 1_000) return `${(hours / 1_000).toFixed(1)}K hrs`
  return `${hours.toLocaleString()} hrs`
}

const formatSubsNet = (gained?: number | null, lost?: number | null) => {
  if (gained == null) return '—'
  const net = (gained ?? 0) - (lost ?? 0)
  if (net >= 0) return `+${net.toLocaleString()}`
  return net.toLocaleString()
}

const formatRevenue = (usd?: number | null) => {
  if (usd == null) return '—'
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const subsNetClass = computed(() => {
  const net = (props.summary?.subscribers_gained ?? 0) - (props.summary?.subscribers_lost ?? 0)
  if (net > 0) return 'text-green-600 dark:text-green-400'
  if (net < 0) return 'text-red-500 dark:text-red-400'
  return 'text-foreground dark:text-white'
})
</script>
