<template>
  <div class="rounded-xl border border-border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="border-b border-border px-5 py-4 dark:border-gray-800">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Channel Performance</h3>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="p-5 space-y-3">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
    </div>

    <!-- Empty -->
    <div v-else-if="!channels.length" class="flex flex-col items-center gap-2 py-16 text-center">
      <svg class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M15 10l4.553-2.069A1 1 0 0121 8.871V15.13a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
      <p class="text-sm text-gray-400">No channels available for this scope</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-border bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200"
              :class="col.align === 'right' ? 'text-right' : 'text-left'"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.key" class="ml-1">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="ch in paginatedChannels"
            :key="ch.channel_id"
            class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
            @click="$emit('channel-click', ch)"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <img
                  v-if="ch.thumbnail_url"
                  :src="ch.thumbnail_url"
                  :alt="ch.title"
                  class="h-7 w-7 rounded-full object-cover"
                />
                <div v-else class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <YoutubeIcon variant="black" class="h-5 w-5" />
                </div>
                <span class="max-w-[160px] truncate font-medium text-foreground dark:text-white" :title="ch.title">{{ ch.title }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ ch.mcn_name || '—' }}</td>
            <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ ch.creator_name || '—' }}</td>
            <td class="px-5 py-3 text-right tabular-nums text-foreground dark:text-white">{{ formatNum(ch.subscribers) }}</td>
            <td class="px-5 py-3 text-right tabular-nums text-foreground dark:text-white">{{ formatViews(ch.views) }}</td>
            <td class="px-5 py-3 text-right tabular-nums text-gray-600 dark:text-gray-400">{{ formatHours(ch.watch_time_minutes) }}</td>
            <td class="px-5 py-3 text-right tabular-nums text-gray-600 dark:text-gray-400">{{ formatRevenue(ch.estimated_revenue_usd) }}</td>
            <td class="px-5 py-3 text-right tabular-nums text-xs text-gray-400">{{ formatRelativeTime(ch.synced_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between border-t border-border px-5 py-3 dark:border-gray-800"
    >
      <p class="text-xs text-gray-500">
        Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, sorted.length) }} of {{ sorted.length }}
      </p>
      <div class="flex gap-1">
        <button
          :disabled="currentPage === 1"
          class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          @click="currentPage--"
        >‹ Prev</button>
        <button
          :disabled="currentPage === totalPages"
          class="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          @click="currentPage++"
        >Next ›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TopChannelItem } from '~/composables/useAnalytics'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'

const props = defineProps<{
  channels: TopChannelItem[]
  loading: boolean
  dateRange?: number
}>()

defineEmits<{ (e: 'channel-click', ch: TopChannelItem): void }>()

const PAGE_SIZE = 20
const pageSize = PAGE_SIZE
const currentPage = ref(1)
const sortKey = ref<keyof TopChannelItem>('views')
const sortDir = ref<'asc' | 'desc'>('desc')

const columns = computed(() => [
  { key: 'title', label: 'Channel', align: 'left' as const },
  { key: 'mcn_name', label: 'MCN', align: 'left' as const },
  { key: 'creator_name', label: 'Creator', align: 'left' as const },
  { key: 'subscribers', label: 'Subscribers', align: 'right' as const },
  { key: 'views', label: `Views (${props.dateRange ?? 30}d)`, align: 'right' as const },
  { key: 'watch_time_minutes', label: 'Watch Time', align: 'right' as const },
  { key: 'estimated_revenue_usd', label: 'Est. Revenue', align: 'right' as const },
  { key: 'synced_at', label: 'Last Synced', align: 'right' as const },
])

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key as keyof TopChannelItem
    sortDir.value = 'desc'
  }
  currentPage.value = 1
}

const sorted = computed(() => {
  return [...props.channels].sort((a, b) => {
    const av = a[sortKey.value] ?? 0
    const bv = b[sortKey.value] ?? 0
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir.value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir.value === 'asc'
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number)
  })
})

const totalPages = computed(() => Math.ceil(sorted.value.length / pageSize))

const paginatedChannels = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})

const formatNum = (v: number | null | undefined) => {
  if (v == null) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toLocaleString()
}

const formatViews = formatNum

const formatHours = (min: number | null | undefined) => {
  if (min == null) return '—'
  const h = Math.round(min / 60)
  return `${h.toLocaleString()} hrs`
}

const formatRevenue = (usd: number | null | undefined) => {
  if (usd == null) return '—'
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatRelativeTime = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>
