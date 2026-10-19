<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <button
        type="button"
        @click="$emit('update:selectionMode', 'mcn')"
        :class="[
          'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
          selectionMode === 'mcn'
            ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/20 dark:text-purple-300'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
        ]"
      >
        By MCN
      </button>
      <button
        type="button"
        @click="$emit('update:selectionMode', 'channel')"
        :class="[
          'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
          selectionMode === 'channel'
            ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-900/20 dark:text-purple-300'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
        ]"
      >
        By Channel
      </button>
    </div>

    <!-- By MCN -->
    <div v-if="selectionMode === 'mcn'">
      <div v-if="loadingMcns" class="flex items-center justify-center py-6">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
      </div>
      <select
        v-else
        :value="mcnId || ''"
        @change="$emit('update:mcnId', ($event.target as HTMLSelectElement).value || null)"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Select an MCN…</option>
        <option v-for="mcn in mcns" :key="mcn.id" :value="mcn.id">{{ mcn.name }}</option>
      </select>
      <p v-if="mcnId" class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        All channels under this MCN will be included — the video set is resolved automatically for the selected period.
      </p>
    </div>

    <!-- By Channel -->
    <div v-else>
      <div class="mb-2 flex items-center justify-between gap-2">
        <input
          v-model="channelSearch"
          type="text"
          placeholder="Search channels…"
          class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <span class="shrink-0 text-xs text-gray-500 dark:text-gray-400">{{ channelIds.length }} selected</span>
      </div>
      <div v-if="loadingChannels" class="flex items-center justify-center py-6">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
      </div>
      <div
        v-else
        class="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <label
          v-for="channel in filteredChannels"
          :key="channel.channel_id"
          class="flex cursor-pointer items-center gap-2 border-b border-gray-100 px-3 py-2 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
        >
          <input
            type="checkbox"
            :checked="channelIds.includes(channel.channel_id)"
            @change="toggleChannel(channel.channel_id)"
            class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span class="min-w-0 flex-1 truncate text-gray-800 dark:text-gray-200">{{ channel.title }}</span>
          <span v-if="channel.mcn_name" class="shrink-0 text-xs text-gray-400 dark:text-gray-500">{{ channel.mcn_name }}</span>
        </label>
        <p v-if="!filteredChannels.length" class="px-3 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
          No channels found.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMcns } from '~/composables/useMcns'
import { useChannels } from '~/composables/useChannels'
import type { MCN } from '~/types/mcn'
import type { YouTubeChannel } from '~/types/channel'

const props = defineProps<{
  selectionMode: 'mcn' | 'channel'
  mcnId: string | null
  channelIds: string[]
}>()

const emit = defineEmits<{
  'update:selectionMode': [value: 'mcn' | 'channel']
  'update:mcnId': [value: string | null]
  'update:channelIds': [value: string[]]
}>()

// Each call to useMcns()/useChannels() creates its own independent reactive
// state (they're not module-scoped singletons) — keep the returned instance
// around and read its `mcns`/`channels` ref directly rather than re-calling
// the composable, which would create a second, never-populated instance.
const mcnsApi = useMcns()
const channelsApi = useChannels()

const mcns = mcnsApi.mcns
const channels = channelsApi.channels
const loadingMcns = ref(false)
const loadingChannels = ref(false)
const channelSearch = ref('')

const filteredChannels = computed(() => {
  const q = channelSearch.value.trim().toLowerCase()
  if (!q) return channels.value
  return channels.value.filter((c) => c.title?.toLowerCase().includes(q))
})

const toggleChannel = (channelId: string) => {
  const next = props.channelIds.includes(channelId)
    ? props.channelIds.filter((id) => id !== channelId)
    : [...props.channelIds, channelId]
  emit('update:channelIds', next)
}

const loadMcns = async () => {
  loadingMcns.value = true
  try {
    await mcnsApi.fetchMcns({ page: 1, page_size: 100 })
  } finally {
    loadingMcns.value = false
  }
}

const loadChannels = async () => {
  loadingChannels.value = true
  try {
    await channelsApi.fetchChannels({ page: 1, page_size: 100 })
  } finally {
    loadingChannels.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadMcns(), loadChannels()])
})
</script>
