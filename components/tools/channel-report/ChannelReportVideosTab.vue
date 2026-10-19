<template>
  <div class="space-y-6">
    <!-- Actions bar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ videoRangeStart }}–{{ videoRangeEnd }} of {{ filteredVideos.length }} videos<span v-if="searchQuery.trim()"> ({{ videos.length }} total)</span>
        <span v-if="failedUrls.length" class="ml-2 text-amber-600 dark:text-amber-400">
          · {{ failedUrls.length }} failed
        </span>
      </p>
      <div class="flex items-center gap-2">
        <select
          v-model="searchField"
          class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="all">All fields</option>
          <option value="title">Video Title</option>
          <option value="channel">Channel Name</option>
          <option value="url">Video URL</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search videos..."
          class="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- Videos table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[900px] text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('title')">
              Video {{ sortIcon('title') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Channel</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('views')">
              Views {{ sortIcon('views') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('likes')">
              Likes {{ sortIcon('likes') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('comments')">
              Comments {{ sortIcon('comments') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('engagement')">
              Eng. Rate {{ sortIcon('engagement') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Duration</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
          </tr>
        </thead>
        <tbody v-if="!sortedVideos.length">
          <tr>
            <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No videos match your search.
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
          <tr
            v-for="video in paginatedVideos"
            :key="video.video_id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/40"
          >
            <td class="px-4 py-3">
              <div class="flex max-w-[420px] items-center gap-3">
                <img
                  v-if="video.snippet.thumbnail_url && !failedThumbnails.has(video.video_id)"
                  :src="video.snippet.thumbnail_url"
                  :alt="`${video.snippet.title} thumbnail`"
                  class="h-14 w-24 flex-shrink-0 rounded-md bg-gray-100 object-cover dark:bg-gray-800"
                  loading="lazy"
                  @error="failedThumbnails.add(video.video_id)"
                />
                <div v-else class="flex h-14 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500" aria-hidden="true">
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" /></svg>
                </div>
                <div class="min-w-0">
                  <a
                    :href="video.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block max-w-[280px] truncate font-medium text-purple-600 hover:text-purple-700 focus-visible:outline-none focus-visible:underline dark:text-purple-400"
                    :title="video.snippet.title"
                  >
                    {{ video.snippet.title }}
                  </a>
                  <p class="text-xs text-gray-400">{{ formatPublished(video.snippet.published_at) }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[140px] truncate">{{ video.snippet.channel_title }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{{ fmt(video.statistics.view_count) }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{{ fmt(video.statistics.like_count) }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{{ fmt(video.statistics.comment_count) }}</td>
            <td class="px-4 py-3 text-right font-mono">
              <span
                v-if="video.statistics.engagement_rate != null"
                :class="engagementColor(video.statistics.engagement_rate)"
              >
                {{ video.statistics.engagement_rate.toFixed(2) }}%
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ video.content.duration_formatted }}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ video.snippet.category_label || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
      <p class="text-xs text-gray-500 dark:text-gray-400">Showing {{ videoRangeStart }}–{{ videoRangeEnd }} of {{ filteredVideos.length }} videos</p>
      <nav class="flex flex-wrap items-center gap-1" aria-label="Video pages">
        <button type="button" :disabled="page <= 1" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:hover:bg-gray-800" @click="page--">Prev</button>
        <button v-for="pageNumber in pageNumbers" :key="pageNumber" type="button" :aria-current="pageNumber === page ? 'page' : undefined" :aria-label="`Go to video page ${pageNumber}`" :class="['min-w-8 rounded-lg border px-2.5 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700', pageNumber === page ? 'border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500' : 'border-border hover:bg-gray-50 dark:hover:bg-gray-800']" @click="page = pageNumber">{{ pageNumber }}</button>
        <button type="button" :disabled="page >= totalPages" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:hover:bg-gray-800" @click="page++">Next</button>
      </nav>
    </div>

    <!-- Failed URLs -->
    <div v-if="failedUrls.length" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
      <p class="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-200">URLs that could not be fetched</p>
      <ul class="space-y-1">
        <li v-for="f in failedUrls" :key="f.url" class="text-xs text-amber-800 dark:text-amber-100/90">
          <span class="font-mono">{{ f.url }}</span>
          <span class="ml-2 text-amber-700 dark:text-amber-300/80">{{ f.reason }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelReport, VideoEntry } from '~/composables/useChannelReport'

const props = defineProps<{ report: ChannelReport }>()
defineEmits<{ download: [] }>()

type SortKey = 'title' | 'views' | 'likes' | 'comments' | 'engagement'
type SearchField = 'all' | 'title' | 'channel' | 'url'

const sortKey = ref<SortKey>('views')
const sortAsc = ref(false)
const searchField = ref<SearchField>('all')
const searchQuery = ref('')
const failedThumbnails = ref(new Set<string>())
const page = ref(1)
const pageSize = 20

const videos = computed(() => props.report.report_data?.videos || [])
const failedUrls = computed(() => props.report.report_data?.failed_urls || [])

const filteredVideos = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return videos.value
  return videos.value.filter((v) => {
    if (searchField.value === 'title' || searchField.value === 'all') {
      if (v.snippet.title?.toLowerCase().includes(q)) return true
    }
    if (searchField.value === 'channel' || searchField.value === 'all') {
      if (v.snippet.channel_title?.toLowerCase().includes(q)) return true
    }
    if (searchField.value === 'url' || searchField.value === 'all') {
      if (v.url?.toLowerCase().includes(q)) return true
    }
    return false
  })
})

const sort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = key === 'title'
  }
}

const sortIcon = (key: SortKey) =>
  sortKey.value !== key ? '' : sortAsc.value ? '↑' : '↓'

const sortedVideos = computed(() => {
  const list = [...filteredVideos.value]
  list.sort((a, b) => {
    let va: number | string = 0
    let vb: number | string = 0
    if (sortKey.value === 'title') { va = a.snippet.title; vb = b.snippet.title }
    else if (sortKey.value === 'views') { va = a.statistics.view_count; vb = b.statistics.view_count }
    else if (sortKey.value === 'likes') { va = a.statistics.like_count; vb = b.statistics.like_count }
    else if (sortKey.value === 'comments') { va = a.statistics.comment_count; vb = b.statistics.comment_count }
    else if (sortKey.value === 'engagement') { va = a.statistics.engagement_rate ?? -1; vb = b.statistics.engagement_rate ?? -1 }
    if (typeof va === 'string') return sortAsc.value ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
    return sortAsc.value ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedVideos.value.length / pageSize)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))
const paginatedVideos = computed(() => sortedVideos.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const videoRangeStart = computed(() => sortedVideos.value.length ? (page.value - 1) * pageSize + 1 : 0)
const videoRangeEnd = computed(() => Math.min(page.value * pageSize, sortedVideos.value.length))

watch([searchQuery, searchField], () => { page.value = 1 })
watch(totalPages, (total) => { if (page.value > total) page.value = total })

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const formatPublished = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

const engagementColor = (rate: number) => {
  if (rate >= 5) return 'text-green-600 dark:text-green-400'
  if (rate >= 2) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-600 dark:text-gray-400'
}
</script>
