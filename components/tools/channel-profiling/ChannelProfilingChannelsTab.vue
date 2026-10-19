<template>
  <div class="space-y-6">
    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Channels</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ profiling.aggregates.channel_count }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Subscribers</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(profiling.aggregates.total_subscribers) }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Channel Lifetime Views</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(profiling.aggregates.total_views) }}</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Videos</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(profiling.aggregates.total_videos) }}</p>
      </div>
    </div>

    <p class="-mt-4 text-xs text-gray-500 dark:text-gray-400">Audience and view totals are public channel snapshots captured when each channel was last fetched.</p>

    <!-- Controls -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            aria-label="Search channels by name, handle, or channel ID"
            placeholder="Search name, handle, or channel ID…"
            class="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <!-- Sort -->
        <select
          v-model="sortBy"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="subscribers">Subscribers</option>
          <option value="views">Views</option>
          <option value="videos">Videos</option>
          <option value="title">Name (A–Z)</option>
          <option value="fetched_at">Last Fetched</option>
        </select>
      </div>
      <!-- Export -->
      <button
        @click="$emit('download')"
        :disabled="downloadLoading"
        class="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ downloadLoading ? 'Downloading…' : 'Export Excel' }}
      </button>
    </div>

    <!-- Channel table -->
    <div class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div v-if="!sortedChannels.length" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        No channels match your search.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800">
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Channel</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Subscribers</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Views</th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Videos</th>
            <th class="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 lg:table-cell">Country</th>
            <th class="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 xl:table-cell">Fetched</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="ch in sortedChannels"
            :key="ch.id"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
            @click="$emit('select', ch)"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="ch.thumbnail_url"
                  :src="ch.thumbnail_url"
                  :alt="ch.title || ''"
                  class="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                />
                <div v-else class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <svg class="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-900 dark:text-white">{{ ch.title || '—' }}</p>
                  <p v-if="ch.custom_url" class="truncate text-xs text-gray-500 dark:text-gray-400">{{ ch.custom_url }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
              <span v-if="ch.hidden_subscriber_count" class="text-xs text-gray-400 dark:text-gray-500">Hidden</span>
              <span v-else>{{ formatNumber(ch.subscriber_count) }}</span>
            </td>
            <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{{ formatNumber(ch.view_count) }}</td>
            <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{{ formatNumber(ch.video_count) }}</td>
            <td class="hidden px-4 py-3 text-gray-600 dark:text-gray-400 lg:table-cell">{{ ch.country || '—' }}</td>
            <td class="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 xl:table-cell">{{ formatFetched(ch.fetched_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Failed URLs -->
    <div v-if="profiling.failed_urls?.length" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/20">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {{ profiling.failed_urls.length }} URL{{ profiling.failed_urls.length !== 1 ? 's' : '' }} failed to import
        </p>
        <button @click="showFailed = !showFailed" class="text-xs font-medium text-amber-700 underline hover:text-amber-800 dark:text-amber-400">
          {{ showFailed ? 'Hide' : 'Show' }}
        </button>
      </div>
      <ul v-if="showFailed" class="mt-3 space-y-1.5">
        <li v-for="f in profiling.failed_urls" :key="f.url" class="text-xs text-amber-700 dark:text-amber-400">
          <span class="font-mono">{{ f.url }}</span>
          <span class="ml-2 text-amber-600 dark:text-amber-500">— {{ f.reason }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelProfilingOut, ChannelOut } from '~/composables/useChannelProfiling'

const props = defineProps<{
  profiling: ChannelProfilingOut
  downloadLoading?: boolean
}>()

defineEmits<{
  download: []
  select: [channel: ChannelOut]
}>()

const search = ref('')
const sortBy = ref<'subscribers' | 'views' | 'videos' | 'title' | 'fetched_at'>('subscribers')
const showFailed = ref(false)

const filteredChannels = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.profiling.channels
  return props.profiling.channels.filter(
    (ch) =>
      (ch.title || '').toLowerCase().includes(q) ||
      (ch.custom_url || '').toLowerCase().includes(q) ||
      ch.channel_id.toLowerCase().includes(q)
  )
})

const sortedChannels = computed(() => {
  const list = [...filteredChannels.value]
  switch (sortBy.value) {
    case 'subscribers': return list.sort((a, b) => (b.subscriber_count ?? -1) - (a.subscriber_count ?? -1))
    case 'views': return list.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    case 'videos': return list.sort((a, b) => (b.video_count ?? 0) - (a.video_count ?? 0))
    case 'title': return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    case 'fetched_at': return list.sort((a, b) => (b.fetched_at || '').localeCompare(a.fetched_at || ''))
    default: return list
  }
})

const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const formatFetched = (d: string | null) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}
</script>
