<template>
  <div class="space-y-6">
    <!-- Top bar -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-gray-400 dark:text-gray-600">
        Data fetched at {{ formatFetchedAt(report.report_data!.fetched_at) }}
      </p>
      <div v-if="!hideActions" class="flex items-center gap-2">
        <button
          @click="emit('download')"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Excel
        </button>
        <button
          @click="emit('pdf')"
          :disabled="pdfLoading"
          class="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <svg v-if="pdfLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {{ pdfLoading ? 'Generating…' : 'PDF' }}
        </button>
        <button
          @click="emit('sheets')"
          :disabled="sheetsLoading"
          class="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
        >
          <svg v-if="sheetsLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.9 2H8.1C6.9 2 6 2.9 6 4.1V6H4.1C2.9 6 2 6.9 2 8.1v11.8C2 21.1 2.9 22 4.1 22h11.8c1.2 0 2.1-.9 2.1-2.1V18h1.9c1.2 0 2.1-.9 2.1-2.1V4.1C22 2.9 21.1 2 19.9 2zM16 19.9c0 .1-.1.1-.1.1H4.1c-.1 0-.1-.1-.1-.1V8.1C4 8 4.1 8 4.1 8H6v7.9C6 17.1 6.9 18 8.1 18H16v1.9zm4-4c0 .1-.1.1-.1.1H8.1c-.1 0-.1-.1-.1-.1V4.1C8 4 8.1 4 8.1 4h11.8c.1 0 .1.1.1.1V15.9z"/>
            <path d="M10 7h6v1.5h-6zm0 3h6v1.5h-6zm0 3h4v1.5h-4z"/>
          </svg>
          {{ sheetsLoading ? 'Creating…' : 'Google Sheets' }}
        </button>
      </div>
    </div>

    <!-- Failed URLs notice -->
    <div
      v-if="failedUrls.length"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30"
    >
      <div class="flex items-start gap-3">
        <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">
            {{ failedUrls.length }} URL{{ failedUrls.length !== 1 ? 's' : '' }} could not be fetched
          </p>
          <ul class="mt-1 space-y-0.5">
            <li v-for="f in failedUrls" :key="f.url" class="text-xs text-amber-800 dark:text-amber-100/90">
              <span class="font-mono">{{ f.url }}</span>
              <span class="ml-1 text-amber-700 dark:text-amber-300/80">— {{ f.reason }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Failed channel URLs notice -->
    <div
      v-if="failedChannelUrls.length"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30"
    >
      <div class="flex items-start gap-3">
        <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">
            {{ failedChannelUrls.length }} channel URL{{ failedChannelUrls.length !== 1 ? 's' : '' }} could not be fetched
          </p>
          <ul class="mt-1 space-y-0.5">
            <li v-for="f in failedChannelUrls" :key="f.url" class="text-xs text-amber-800 dark:text-amber-100/90">
              <span class="font-mono">{{ f.url }}</span>
              <span class="ml-1 text-amber-700 dark:text-amber-300/80">— {{ f.reason }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Videos Fetched</p>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ agg.video_count }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Views</p>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ fmt(agg.total_views) }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Avg Engagement Rate</p>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ agg.avg_engagement_rate != null ? agg.avg_engagement_rate.toFixed(2) + '%' : '—' }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Avg Views / Video</p>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ fmt(Math.round(agg.avg_views)) }}</p>
      </div>
    </div>
    <details class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <summary class="cursor-pointer px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Video and audience details</summary>
      <div class="grid grid-cols-2 gap-4 border-t border-gray-100 p-5 sm:grid-cols-3 lg:grid-cols-4 dark:border-gray-800">
        <div><p class="text-xs text-gray-500">Total Likes</p><p class="mt-1 font-semibold text-gray-900 dark:text-white">{{ fmt(agg.total_likes) }}</p></div>
        <div><p class="text-xs text-gray-500">Total Comments</p><p class="mt-1 font-semibold text-gray-900 dark:text-white">{{ fmt(agg.total_comments) }}</p></div>
        <div><p class="text-xs text-gray-500">HD Videos</p><p class="mt-1 font-semibold text-gray-900 dark:text-white">{{ agg.hd_count }}</p></div>
        <div><p class="text-xs text-gray-500">With Captions</p><p class="mt-1 font-semibold text-gray-900 dark:text-white">{{ agg.captioned_count }}</p></div>
        <div><p class="text-xs text-gray-500">Total Channels</p><p class="mt-1 font-semibold text-gray-900 dark:text-white">{{ channelAgg.channel_count }}</p></div>
        <div><p class="text-xs text-gray-500">Total Subscribers</p><p class="mt-1 font-semibold text-gray-900 dark:text-white">{{ channelAgg.channel_count > 0 && channelAgg.total_subscribers === 0 ? '—' : fmt(channelAgg.total_subscribers) }}</p></div>
      </div>
    </details>
    <p class="text-xs text-gray-400 dark:text-gray-600">Avg Engagement Rate and Avg Views / Video are calculated by Atlas from YouTube-reported video statistics — not official YouTube metrics.</p>

    <!-- Top 3 videos -->
    <div v-if="topVideos.length" class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Top Videos by Views</h2>
      <div class="space-y-3">
        <div
          v-for="(video, i) in topVideos"
          :key="video.video_id"
          class="flex items-center gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800"
        >
          <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {{ i + 1 }}
          </span>
          <img
            v-if="video.snippet.thumbnail_url"
            :src="video.snippet.thumbnail_url"
            :alt="video.snippet.title"
            class="h-14 w-24 flex-shrink-0 rounded object-cover"
          />
          <div class="min-w-0 flex-1">
            <a
              :href="video.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate text-sm font-medium text-gray-900 hover:text-purple-600 dark:text-white dark:hover:text-purple-400"
            >
              {{ video.snippet.title }}
            </a>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ video.snippet.channel_title }}</p>
          </div>
          <div class="flex-shrink-0 text-right">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ fmt(video.statistics.view_count) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">views</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { CampaignReport } from '~/composables/useCampaignReport'

const props = defineProps<{ report: CampaignReport; sheetsLoading?: boolean; pdfLoading?: boolean; hideActions?: boolean }>()
const emit = defineEmits<{ download: []; sheets: []; pdf: [] }>()

const agg = computed(() => props.report.report_data!.aggregates)
const channelAgg = computed(() => props.report.report_data!.channel_aggregates ?? { channel_count: 0, total_subscribers: 0 })
const failedUrls = computed(() => props.report.report_data!.failed_urls || [])
const failedChannelUrls = computed(() => props.report.report_data!.failed_channel_urls || [])

const topVideos = computed(() =>
  [...(props.report.report_data!.videos || [])]
    .sort((a, b) => b.statistics.view_count - a.statistics.view_count)
    .slice(0, 3)
)

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const formatFetchedAt = (d: string) => {
  try {
    return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return d
  }
}
</script>
