<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Back nav -->
    <div class="col-span-12">
      <NuxtLink
        to="/app/analytics"
        class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Analytics
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !channelData" class="col-span-12 flex items-center justify-center py-16">
      <div class="text-center">
        <div class="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-r-transparent" />
        <p class="text-sm text-gray-500">Fetching analytics from YouTube…</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error && !loading && !channelData" class="col-span-12">
      <div class="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
        <div>
          <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ friendlyError }}</p>
          <p v-if="friendlyErrorDetail" class="mt-1 text-xs text-red-600 dark:text-red-500">{{ friendlyErrorDetail }}</p>
        </div>
        <button
          class="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300"
          @click="loadData"
        >Try Again</button>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="channelData">
      <!-- Channel header -->
      <div class="col-span-12">
        <div class="rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-center gap-4">
              <img
                v-if="channelData.thumbnail_url"
                :src="channelData.thumbnail_url"
                :alt="channelData.channel_title"
                class="h-16 w-16 rounded-full object-cover border-2 border-border dark:border-gray-700"
              />
              <div
                v-else
                class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <YoutubeIcon variant="black" class="h-8 w-8" />
              </div>
              <div>
                <h1 class="text-xl font-bold text-foreground dark:text-white">{{ channelData.channel_title }}</h1>
                <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="channelData.mcn_name">MCN: {{ channelData.mcn_name }}</span>
                  <span v-if="channelData.mcn_name && channelData.creator_name"> · </span>
                  <span v-if="channelData.creator_name">Creator: {{ channelData.creator_name }}</span>
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  Data as of yesterday · Last synced {{ relativeTime(channelData.fetched_at) }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-start gap-2 sm:items-end">
              <div class="flex items-center gap-2">
                <button
                  :disabled="refreshing"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  @click="handleRefresh"
                >
                  <svg :class="['h-3.5 w-3.5', refreshing && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ refreshing ? 'Refreshing…' : 'Refresh Data' }}
                </button>
                <a
                  :href="`https://studio.youtube.com/channel/${channelData.channel_id}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in YouTube Studio
                </a>
              </div>
              <!-- Date range toggle -->
              <div class="flex rounded-lg border border-border dark:border-gray-700 overflow-hidden text-xs">
                <button
                  v-for="d in [7, 14, 30]"
                  :key="d"
                  :class="['px-3 py-1.5 transition-colors', dateRange === d ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800']"
                  @click="setDateRange(d)"
                >{{ d }}d</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="col-span-12">
        <AnalyticsSummaryCards
          :summary="channelData.summary"
          :loading="loading"
          :date-range="dateRange"
        />
      </div>

      <!-- Views timeseries -->
      <div class="col-span-12">
        <ViewsTimeseriesChart
          :timeseries="channelData.daily_timeseries"
          :loading="loading"
          :date-range="dateRange"
        />
      </div>

      <!-- Top videos table -->
      <div class="col-span-12">
        <TopVideosTable
          :videos="videosData?.top_videos ?? []"
          :loading="videosLoading"
          :date-range="dateRange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAnalytics, type ChannelAnalyticsResponse, type TopVideosResponse } from '~/composables/useAnalytics'

import YoutubeIcon from '~/components/common/YoutubeIcon.vue'
import AnalyticsSummaryCards from '~/components/analytics/AnalyticsSummaryCards.vue'
import ViewsTimeseriesChart from '~/components/analytics/ViewsTimeseriesChart.vue'
import TopVideosTable from '~/components/analytics/TopVideosTable.vue'

const route = useRoute()
const channelId = route.params.channel_id as string

const { loading, refreshing, error, fetchChannelDetail, fetchChannelTopVideos, refreshData } = useAnalytics()
const videosLoading = ref(false)

const dateRange = ref(30)
const channelData = ref<ChannelAnalyticsResponse | null>(null)
const videosData = ref<TopVideosResponse | null>(null)

// Map raw backend details to actionable guidance; keep the raw string visible
// for debugging instead of rendering it as the headline.
const friendlyError = computed(() => {
  if (error.value === 'Access denied to this channel') {
    return "You don't have access to this channel's analytics. If you own this channel, ask your operator to check your channel assignment."
  }
  if (error.value === 'Channel not found' || error.value === 'Channel not found or not accessible') {
    return 'Channel not found or not accessible.'
  }
  return error.value
})

const friendlyErrorDetail = computed(() => {
  if (
    error.value === 'Access denied to this channel' ||
    error.value === 'Channel not found' ||
    error.value === 'Channel not found or not accessible'
  ) {
    return `Details: ${error.value}`
  }
  return null
})

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  return `${hours}h ago`
}

const loadData = async () => {
  videosLoading.value = true
  const [detail, videos] = await Promise.all([
    fetchChannelDetail(channelId, dateRange.value),
    fetchChannelTopVideos(channelId, dateRange.value),
  ])
  channelData.value = detail
  videosData.value = videos
  videosLoading.value = false
}

const setDateRange = (d: number) => {
  dateRange.value = d
  loadData()
}

const handleRefresh = async () => {
  // Per-channel refresh runs synchronously on the backend, so the snapshots are
  // persisted by the time the request resolves — reload immediately after.
  const ok = await refreshData({ channel_id: channelId, date_range: dateRange.value })
  if (ok) await loadData()
}

onMounted(loadData)
</script>
