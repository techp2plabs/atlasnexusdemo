<template>
  <div class="rounded-xl border border-border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="border-b border-border px-5 py-4 dark:border-gray-800">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Videos</h3>
      <p class="mt-0.5 text-xs text-gray-400">Top 10 by views — last {{ dateRange }} days</p>
    </div>

    <div v-if="loading" class="p-5 space-y-3">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
    </div>

    <div v-else-if="!videos.length" class="flex flex-col items-center gap-2 py-12 text-center">
      <p class="text-sm text-gray-400">No video data available</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-border bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Video Title</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Views</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Watch Time</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Published</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="(video, idx) in videos"
            :key="video.video_id"
            class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
            @click="openVideo(video.video_id)"
          >
            <td class="px-4 py-3 text-gray-400">{{ idx + 1 }}</td>
            <td class="px-4 py-3">
              <span class="block max-w-[300px] truncate font-medium text-foreground dark:text-white" :title="video.title">
                {{ truncate(video.title, 40) }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-foreground dark:text-white">{{ formatViews(video.views) }}</td>
            <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{{ formatHours(video.watch_time_minutes) }}</td>
            <td class="px-4 py-3 text-right text-xs text-gray-400">{{ formatDate(video.published_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopVideoItem } from '~/composables/useAnalytics'

const props = defineProps<{
  videos: TopVideoItem[]
  loading: boolean
  dateRange: number
}>()

const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max) + '…' : s)

const openVideo = (videoId: string) => {
  window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener')
}

const formatViews = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString()
}

const formatHours = (min: number) => {
  const h = Math.round(min / 60)
  return `${h.toLocaleString()} hrs`
}

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
