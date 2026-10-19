<template>
  <!-- Overlay -->
  <Teleport to="body">
    <div v-if="channel" class="fixed inset-0 z-40 flex justify-end">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30 dark:bg-black/50" @click="$emit('close')" />

      <!-- Floating close button — fixed so it always hugs the panel's left edge -->
      <button
        @click="$emit('close')"
        :style="{ right: 'calc(min(100vw, 28rem) + 8px)' }"
        class="fixed top-5 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10 transition hover:bg-gray-100 dark:bg-gray-800 dark:ring-white/10 dark:hover:bg-gray-700"
        aria-label="Close panel"
      >
        <svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Panel -->
      <div class="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-gray-900">
        <!-- Sticky header — stays visible while content scrolls -->
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Channel Detail</h2>
          <button @click="$emit('close')" class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
        <div class="space-y-6 p-6">
          <!-- Channel identity -->
          <div class="flex items-start gap-4">
            <img
              v-if="channel.thumbnail_url"
              :src="channel.thumbnail_url"
              :alt="channel.title || ''"
              class="h-16 w-16 flex-shrink-0 rounded-full object-cover"
            />
            <div v-else class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <svg class="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ channel.title || '—' }}</p>
              <p v-if="channel.custom_url" class="text-sm text-gray-500 dark:text-gray-400">{{ channel.custom_url }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-if="channel.country" class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {{ channel.country }}
                </span>
                <a
                  :href="channel.source_url || `https://www.youtube.com/channel/${channel.channel_id}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                  @click.stop
                >
                  <YoutubeIcon variant="red" class="h-5 w-5" />
                  YouTube
                </a>
              </div>
            </div>
          </div>

          <!-- Stats cards -->
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/50">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Subscribers</p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                <span v-if="channel.hidden_subscriber_count" class="text-sm text-gray-400">Hidden</span>
                <span v-else>{{ formatNumber(channel.subscriber_count) }}</span>
              </p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/50">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Views</p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(channel.view_count) }}</p>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-800/50">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Videos</p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(channel.video_count) }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="channel.description">
            <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">About</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {{ showFullDesc ? channel.description : truncatedDesc }}
            </p>
            <button
              v-if="channel.description.length > 200"
              @click="showFullDesc = !showFullDesc"
              class="mt-1 text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
            >
              {{ showFullDesc ? 'Show less' : 'Show more' }}
            </button>
          </div>

          <!-- Topics -->
          <div v-if="channel.topics?.length">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Topics</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="topic in channel.topics"
                :key="topic"
                class="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              >{{ topic }}</span>
            </div>
          </div>

          <!-- Keywords -->
          <div v-if="channel.keywords?.length">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Keywords</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="kw in channel.keywords.slice(0, 15)"
                :key="kw"
                class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >{{ kw }}</span>
            </div>
          </div>

          <!-- Meta -->
          <div class="space-y-1.5 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Channel ID</span>
              <span class="font-mono">{{ channel.channel_id }}</span>
            </div>
            <div v-if="channel.published_at" class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Created</span>
              <span>{{ formatDate(channel.published_at) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Last fetched</span>
              <span>{{ formatDate(channel.fetched_at) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="refreshError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{{ refreshError }}</div>
          <div v-if="removeError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{{ removeError }}</div>
          <div class="flex gap-3">
            <button
              @click="runRefresh"
              :disabled="refreshing || removing"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg :class="['h-4 w-4', refreshing && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ refreshing ? 'Refreshing…' : 'Refresh Stats' }}
            </button>
            <button
              @click="runRemove"
              :disabled="removing || refreshing"
              class="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              title="Remove from project"
            >
              <svg :class="['h-4 w-4', removing && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!removing" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ removing ? 'Removing…' : 'Remove' }}
            </button>
            <button
              @click="$emit('close')"
              class="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Close"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        </div><!-- /scroll area -->
      </div><!-- /panel -->
    </div><!-- /overlay -->
  </Teleport>
</template>

<script setup lang="ts">
import type { ChannelOut } from '~/composables/useChannelProfiling'
import YoutubeIcon from '~/components/common/YoutubeIcon.vue'

const props = defineProps<{
  channel: ChannelOut | null
  profilingId: string
}>()

const emit = defineEmits<{
  close: []
  refreshed: [channel: ChannelOut]
  removed: [channelId: string]
}>()

const { refreshChannel, removeChannel } = useChannelProfiling()

const showFullDesc = ref(false)
const refreshing = ref(false)
const refreshError = ref<string | null>(null)
const removing = ref(false)
const removeError = ref<string | null>(null)

const truncatedDesc = computed(() =>
  (props.channel?.description || '').slice(0, 200) + ((props.channel?.description?.length || 0) > 200 ? '…' : '')
)

watch(() => props.channel, () => {
  showFullDesc.value = false
  refreshError.value = null
  removeError.value = null
})

const runRemove = async () => {
  if (!props.channel) return
  removing.value = true
  removeError.value = null
  try {
    await removeChannel(props.profilingId, props.channel.channel_id)
    emit('removed', props.channel.channel_id)
    emit('close')
  } catch (e: any) {
    removeError.value = e?.response?.data?.detail || 'Remove failed'
  } finally {
    removing.value = false
  }
}

const runRefresh = async () => {
  if (!props.channel) return
  refreshing.value = true
  refreshError.value = null
  try {
    const updated = await refreshChannel(props.profilingId, props.channel.channel_id)
    emit('refreshed', updated)
  } catch (e: any) {
    refreshError.value = e?.response?.data?.detail || 'Refresh failed'
  } finally {
    refreshing.value = false
  }
}

const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}
</script>
