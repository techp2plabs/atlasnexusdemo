<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Loading -->
    <div v-if="loading && !profiling" class="col-span-12 flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError && !profiling" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-800 dark:text-red-300">{{ fetchError }}</p>
          <NuxtLink to="/app/creator-suites/youtube-channel-profiling" class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300">
            Back to list
          </NuxtLink>
        </div>
      </div>
    </div>

    <template v-else-if="profiling">
      <!-- Page header -->
      <div class="col-span-12 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ profiling.name }}</h1>
            <span :class="statusBadgeClass(profiling.status)">{{ statusLabel(profiling.status) }}</span>
            <span v-if="profiling.status === 'processing'" class="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <span class="h-3 w-3 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></span>
              Processing…
            </span>
          </div>
          <p v-if="profiling.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ profiling.description }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <p class="text-xs text-gray-400 dark:text-gray-500">Created {{ formatDate(profiling.created_at) }}</p>
            <span v-if="profiling.owner_email" class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Owner: {{ profiling.owner_email }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="col-span-12">
        <Tabs :tabs="tabs" v-model="activeTab">
          <template #channels>
            <div v-if="profiling.status === 'processing'" class="flex flex-col items-center justify-center py-20 text-center">
              <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
              <p class="text-base font-medium text-foreground dark:text-white">Importing channels…</p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">This usually takes a few seconds. The page will update automatically.</p>
            </div>
            <div v-else-if="profiling.status === 'pending' || !profiling.channels.length" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No channels imported yet. Use the Setup tab to import channels.
            </div>
            <ChannelProfilingChannelsTab
              v-else
              :profiling="profiling"
              :downloadLoading="downloadLoading"
              @download="handleDownload"
              @select="openChannelPanel"
            />
          </template>

          <template #setup>
            <ChannelProfilingSetupTab
              :profiling="profiling"
              @updated="onProfilingUpdated"
              @imported="onImported"
            />
          </template>

          <template #share>
            <ChannelProfilingShareTab :profiling="profiling" />
          </template>
        </Tabs>
      </div>
    </template>

    <!-- Channel detail panel -->
    <ChannelProfilingDetailPanel
      :channel="selectedChannel"
      :profilingId="(route.params.id as string)"
      @close="selectedChannel = null"
      @refreshed="onChannelRefreshed"
      @removed="onChannelRemoved"
    />
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Tabs from '~/components/common/Tabs.vue'
import ChannelProfilingSetupTab from '~/components/tools/channel-profiling/ChannelProfilingSetupTab.vue'
import ChannelProfilingChannelsTab from '~/components/tools/channel-profiling/ChannelProfilingChannelsTab.vue'
import ChannelProfilingShareTab from '~/components/tools/channel-profiling/ChannelProfilingShareTab.vue'
import ChannelProfilingDetailPanel from '~/components/tools/channel-profiling/ChannelProfilingDetailPanel.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { Tab } from '~/components/common/Tabs.vue'
import { useChannelProfiling, type ChannelProfilingOut, type ChannelOut } from '~/composables/useChannelProfiling'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator', 'creator'],
})

const route = useRoute()
const router = useRouter()
const { fetchProfiling, downloadExcel } = useChannelProfiling()

const profiling = ref<ChannelProfilingOut | null>(null)
const loading = ref(true)
const fetchError = ref<string | null>(null)
const downloadLoading = ref(false)
const selectedChannel = ref<ChannelOut | null>(null)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const activeTab = ref<string>((route.query.tab as string) || 'setup')

const tabs = computed<Tab[]>(() => [
  { id: 'channels', label: 'Channels' },
  { id: 'setup', label: 'Setup' },
  { id: 'share', label: 'Share' },
])

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: 'Home', to: '/app/home' },
  { label: 'Creator Suites', to: '/app/creator-suites' },
  { label: 'YouTube Channel Profiling', to: '/app/creator-suites/youtube-channel-profiling' },
  { label: profiling.value?.name || 'Loading…' },
])

const load = async (silent = false) => {
  if (!silent) loading.value = true
  fetchError.value = null
  try {
    const data = await fetchProfiling(route.params.id as string)
    const wasProcessing = profiling.value?.status === 'processing'
    profiling.value = data

    if (wasProcessing && data.status === 'completed') {
      activeTab.value = 'channels'
    }

    if (data.status === 'processing') {
      schedulePolling()
    }
  } catch (e: any) {
    fetchError.value = e?.response?.data?.detail || 'Failed to load profiling project'
  } finally {
    loading.value = false
  }
}

const schedulePolling = () => {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = setTimeout(() => load(true), 2000)
}

const onProfilingUpdated = (updated: ChannelProfilingOut) => {
  profiling.value = updated
}

const onImported = (updated: ChannelProfilingOut) => {
  profiling.value = updated
  if (updated.status === 'processing') {
    activeTab.value = 'channels'
    schedulePolling()
  } else {
    activeTab.value = 'channels'
  }
}

const openChannelPanel = (channel: ChannelOut) => {
  selectedChannel.value = channel
}

const onChannelRefreshed = (updated: ChannelOut) => {
  if (!profiling.value) return
  const idx = profiling.value.channels.findIndex((c) => c.channel_id === updated.channel_id)
  if (idx !== -1) {
    profiling.value.channels.splice(idx, 1, updated)
  }
  selectedChannel.value = updated
}

const onChannelRemoved = (channelId: string) => {
  if (!profiling.value) return
  profiling.value.channels = profiling.value.channels.filter((c) => c.channel_id !== channelId)
  profiling.value.aggregates.channel_count = profiling.value.channels.length
  selectedChannel.value = null
}

const handleDownload = async () => {
  if (!profiling.value) return
  downloadLoading.value = true
  try {
    await downloadExcel(profiling.value.id, profiling.value.name)
  } finally {
    downloadLoading.value = false
  }
}

watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && tabs.value.find((t) => t.id === newTab)) {
    activeTab.value = newTab
  }
})

const statusLabel = (status: string) => {
  const map: Record<string, string> = { pending: 'Pending', processing: 'Processing', completed: 'Completed', failed: 'Failed' }
  return map[status] || status
}

const statusBadgeClass = (status: string) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  return `${base} ${map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`
}

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

onMounted(async () => {
  await load()
  if (!route.query.tab && profiling.value) {
    activeTab.value = profiling.value.status === 'completed' && profiling.value.channels.length
      ? 'channels'
      : 'setup'
  }
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
})
</script>
