<template>
  <div class="space-y-6">
    <!-- Actions bar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ filteredChannels.length }} of {{ channels.length }} channel{{ channels.length !== 1 ? 's' : '' }}
        <span v-if="failedChannelUrls.length" class="ml-2 text-amber-600 dark:text-amber-400">
          · {{ failedChannelUrls.length }} failed
        </span>
      </p>
      <div class="flex items-center gap-2">
        <select
          v-model="searchField"
          class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <option value="all">All fields</option>
          <option value="title">Channel Name</option>
          <option value="url">Channel URL</option>
          <option value="country">Country</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search channels..."
          class="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>

    <!-- Channels table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[800px] text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('title')">
              Channel {{ sortIcon('title') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('subscribers')">
              Subscribers {{ sortIcon('subscribers') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('views')">
              Total Views {{ sortIcon('views') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('videos')">
              Videos {{ sortIcon('videos') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Country</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Topics</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer" @click="sort('created')">
              Created {{ sortIcon('created') }}
            </th>
          </tr>
        </thead>
        <tbody v-if="!sortedChannels.length">
          <tr>
            <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No channels match your search.
            </td>
          </tr>
        </tbody>
        <tbody v-else class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
          <tr
            v-for="channel in sortedChannels"
            :key="channel.channel_id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/40"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="channel.snippet.thumbnail_url"
                  :src="channel.snippet.thumbnail_url"
                  :alt="channel.snippet.title"
                  class="h-10 w-10 flex-shrink-0 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div
                  v-else
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <YoutubeIcon variant="black" class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <a
                    :href="channel.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block font-medium text-purple-600 hover:text-purple-700 hover:underline dark:text-purple-400 truncate max-w-[200px]"
                    :title="channel.snippet.title"
                  >
                    {{ channel.snippet.title }}
                  </a>
                  <p v-if="channel.snippet.custom_url" class="text-xs text-gray-400 dark:text-gray-500">{{ channel.snippet.custom_url }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">
              <span v-if="!channel.statistics.hidden_subscriber_count">{{ fmt(channel.statistics.subscriber_count) }}</span>
              <span v-else class="text-gray-400 italic text-xs">Hidden</span>
            </td>
            <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{{ fmt(channel.statistics.view_count) }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{{ fmt(channel.statistics.video_count) }}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ channel.snippet.country || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1 max-w-[180px]">
                <span
                  v-for="topic in channel.topics.slice(0, 3)"
                  :key="topic"
                  class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >{{ topic }}</span>
                <span v-if="channel.topics.length > 3" class="text-xs text-gray-400">+{{ channel.topics.length - 3 }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{{ formatDate(channel.snippet.published_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Failed channel URLs -->
    <div v-if="failedChannelUrls.length" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
      <p class="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-200">Channel URLs that could not be fetched</p>
      <ul class="space-y-1">
        <li v-for="f in failedChannelUrls" :key="f.url" class="text-xs text-amber-800 dark:text-amber-100/90">
          <span class="font-mono">{{ f.url }}</span>
          <span class="ml-2 text-amber-700 dark:text-amber-300/80">{{ f.reason }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChannelReport, ChannelEntry } from '~/composables/useChannelReport'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'

const props = defineProps<{ report: ChannelReport }>()

type SortKey = 'title' | 'subscribers' | 'views' | 'videos' | 'created'
type SearchField = 'all' | 'title' | 'url' | 'country'

const sortKey = ref<SortKey>('subscribers')
const sortAsc = ref(false)
const searchField = ref<SearchField>('all')
const searchQuery = ref('')

const channels = computed(() => props.report.report_data?.channels || [])
const failedChannelUrls = computed(() => props.report.report_data?.failed_channel_urls || [])

const filteredChannels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return channels.value
  return channels.value.filter((c) => {
    if (searchField.value === 'title' || searchField.value === 'all') {
      if (c.snippet.title?.toLowerCase().includes(q)) return true
    }
    if (searchField.value === 'url' || searchField.value === 'all') {
      if (c.url?.toLowerCase().includes(q)) return true
      if (c.snippet.custom_url?.toLowerCase().includes(q)) return true
    }
    if (searchField.value === 'country' || searchField.value === 'all') {
      if (c.snippet.country?.toLowerCase().includes(q)) return true
    }
    return false
  })
})

const sort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = key === 'title' || key === 'created'
  }
}

const sortIcon = (key: SortKey) =>
  sortKey.value !== key ? '' : sortAsc.value ? '↑' : '↓'

const sortedChannels = computed(() => {
  const list = [...filteredChannels.value]
  list.sort((a, b) => {
    let va: number | string = 0
    let vb: number | string = 0
    if (sortKey.value === 'title') { va = a.snippet.title; vb = b.snippet.title }
    else if (sortKey.value === 'subscribers') { va = a.statistics.subscriber_count; vb = b.statistics.subscriber_count }
    else if (sortKey.value === 'views') { va = a.statistics.view_count; vb = b.statistics.view_count }
    else if (sortKey.value === 'videos') { va = a.statistics.video_count; vb = b.statistics.video_count }
    else if (sortKey.value === 'created') { va = a.snippet.published_at; vb = b.snippet.published_at }
    if (typeof va === 'string') return sortAsc.value ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
    return sortAsc.value ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })
  return list
})

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0)

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}
</script>
