<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <!-- Header -->
    <div class="col-span-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">Analytics</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Data as of yesterday · {{ dataDelay }}
        </p>
      </div>
      <button
        :disabled="refreshing"
        class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        @click="handleRefresh"
      >
        <svg :class="['h-4 w-4', refreshing && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ refreshing ? 'Refreshing…' : 'Refresh Data' }}
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="col-span-12">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Date range pills -->
        <div class="flex rounded-lg border border-border dark:border-gray-700 overflow-hidden text-sm">
          <button
            v-for="d in [7, 14, 30]"
            :key="d"
            :class="['px-4 py-2 transition-colors', dateRange === d ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800']"
            @click="setDateRange(d)"
          >{{ d }} days</button>
        </div>

        <!-- Org filter (superadmin only) -->
        <select
          v-if="isSuperAdmin"
          v-model="selectedOrgId"
          class="rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          @change="onOrgChange"
        >
          <option value="">All Organizations</option>
          <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.brand_name || org.name }}</option>
        </select>

        <!-- MCN filter -->
        <select
          v-if="canFilterMcn"
          v-model="selectedMcnId"
          class="rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          @change="onMcnChange"
        >
          <option value="">All MCNs</option>
          <option v-for="mcn in mcns" :key="mcn.id" :value="mcn.id">{{ mcn.name }}</option>
        </select>

        <!-- Last fetched -->
        <span v-if="lastFetchedAt" class="ml-auto text-xs text-gray-400">
          Updated {{ relativeTime(lastFetchedAt) }}
        </span>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="col-span-12">
      <div class="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        <button
          class="rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300"
          @click="loadAll"
        >Try Again</button>
      </div>
    </div>

    <!-- Warning: partial data -->
    <div v-if="partialWarning" class="col-span-12">
      <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
        ⚠ Some channels could not be fetched from YouTube API. Displayed data may be incomplete.
      </div>
    </div>

    <!-- Warning: excluded channels (no content owner ID nor OAuth connection) -->
    <div v-if="unconnectedChannels.length > 0" class="col-span-12">
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
        <span>
          ⚠ {{ unconnectedChannels.length }} channel{{ unconnectedChannels.length === 1 ? '' : 's' }} not included in analytics data.
          Connect the channel owner's YouTube account to enable analytics for these channels.
        </span>
        <button
          class="whitespace-nowrap font-medium underline hover:no-underline"
          @click="viewAffectedChannels"
        >
          View affected channels →
        </button>
      </div>
    </div>

    <!-- Warning: content-owner channels YouTube is denying analytics access to -->
    <div v-if="permissionDeniedChannels.length > 0" class="col-span-12">
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
        <span>
          ⚠ {{ permissionDeniedChannels.length }} channel{{ permissionDeniedChannels.length === 1 ? '' : 's' }} have a linked content owner but YouTube is denying analytics access.
          This usually means the Atlas service account needs the "View reports" permission granted in YouTube Studio Content Manager for this content owner.
        </span>
        <button
          class="whitespace-nowrap font-medium underline hover:no-underline"
          @click="viewAffectedChannels"
        >
          View affected channels →
        </button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="col-span-12">
      <AnalyticsSummaryCards
        :summary="summaryData?.summary ?? null"
        :loading="loading"
        :date-range="dateRange"
      />
    </div>

    <!-- Views timeseries chart -->
    <div class="col-span-12">
      <ViewsTimeseriesChart
        :timeseries="timeseriesData?.daily_timeseries ?? []"
        :loading="loading"
        :date-range="dateRange"
      />
    </div>

    <!-- Top channels + Revenue pie -->
    <div class="col-span-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TopChannelsChart
        :channels="topChannelsData?.top_channels ?? []"
        :loading="loading"
        v-model:sort-by="topChannelSort"
        @update:sort-by="loadTopChannels"
      />
      <RevenueByMcnChart
        :breakdown="summaryData?.mcn_revenue_breakdown ?? []"
        :loading="loading"
      />
    </div>

    <!-- Channel performance table -->
    <div class="col-span-12">
      <ChannelPerformanceTable
        :channels="topChannelsData?.top_channels ?? []"
        :loading="loading"
        :date-range="dateRange"
        @channel-click="navigateToChannel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalytics, type AnalyticsSummaryResponse, type AnalyticsTimeseriesResponse, type TopChannelsResponse } from '~/composables/useAnalytics'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import type { TopChannelItem } from '~/composables/useAnalytics'

import AnalyticsSummaryCards from '~/components/analytics/AnalyticsSummaryCards.vue'
import ViewsTimeseriesChart from '~/components/analytics/ViewsTimeseriesChart.vue'
import TopChannelsChart from '~/components/analytics/TopChannelsChart.vue'
import RevenueByMcnChart from '~/components/analytics/RevenueByMcnChart.vue'
import ChannelPerformanceTable from '~/components/analytics/ChannelPerformanceTable.vue'

const router = useRouter()
const authStore = useAuthStore()
const { get } = useApi()
const { loading, refreshing, error, lastFetchedAt, fetchSummary, fetchTimeseries, fetchTopChannels, refreshData } = useAnalytics()

const dateRange = ref(30)
const selectedOrgId = ref('')
const selectedMcnId = ref('')
const topChannelSort = ref<'views' | 'revenue'>('views')
const partialWarning = ref(false)

const summaryData = ref<AnalyticsSummaryResponse | null>(null)
const timeseriesData = ref<AnalyticsTimeseriesResponse | null>(null)
const topChannelsData = ref<TopChannelsResponse | null>(null)

const organizations = ref<any[]>([])
const mcns = ref<any[]>([])

const isSuperAdmin = computed(() => {
  const role = authStore.user?.role
  return role === 'atlas_superadmin' || role === 'atlas_admin'
})

const canFilterMcn = computed(() => {
  const role = authStore.user?.role
  return role !== 'mcn_operator' && role !== 'creator'
})

const dataDelay = computed(() => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const scopeParams = computed(() => ({
  date_range: dateRange.value,
  org_id: selectedOrgId.value || null,
  mcn_id: selectedMcnId.value || null,
}))

const loadAll = async () => {
  partialWarning.value = false
  const [summary, ts, topCh] = await Promise.all([
    fetchSummary(scopeParams.value),
    fetchTimeseries(scopeParams.value),
    fetchTopChannels(scopeParams.value, topChannelSort.value),
  ])
  summaryData.value = summary
  timeseriesData.value = ts
  topChannelsData.value = topCh
}

const loadTopChannels = async () => {
  topChannelsData.value = await fetchTopChannels(scopeParams.value, topChannelSort.value)
}

const setDateRange = (d: number) => {
  dateRange.value = d
  loadAll()
}

const onOrgChange = () => {
  selectedMcnId.value = ''
  loadMcns()
  loadAll()
}

const onMcnChange = () => {
  loadAll()
}

const handleRefresh = async () => {
  const ok = await refreshData({
    org_id: selectedOrgId.value || null,
    mcn_id: selectedMcnId.value || null,
  })
  if (ok) await loadAll()
}

const navigateToChannel = (ch: TopChannelItem) => {
  router.push(`/app/analytics/channels/${ch.channel_id}`)
}

const excludedChannels = computed(() => summaryData.value?.excluded_channels ?? [])
const unconnectedChannels = computed(() =>
  excludedChannels.value.filter((c) => c.reason === 'no_content_owner_or_oauth')
)
const permissionDeniedChannels = computed(() =>
  excludedChannels.value.filter((c) => c.reason === 'permission_denied' || c.reason === 'fetch_error')
)

const viewAffectedChannels = () => {
  // Channels list page doesn't yet support filtering by a list of channel IDs;
  // navigate to the list so the admin can locate them manually.
  router.push('/app/channels')
}

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  return `${hours}h ago`
}

const loadMcns = async () => {
  try {
    const params: Record<string, any> = { page_size: 100 }
    if (selectedOrgId.value) params.organization_id = selectedOrgId.value
    const res = await get('/api/v1/mcns', { params })
    mcns.value = res.data?.items ?? []
  } catch {
    mcns.value = []
  }
}

const loadOrgs = async () => {
  if (!isSuperAdmin.value) return
  try {
    const res = await get('/api/v1/organizations', { params: { page_size: 100 } })
    organizations.value = res.data?.items ?? []
  } catch {
    organizations.value = []
  }
}

onMounted(async () => {
  await Promise.all([loadOrgs(), loadMcns()])
  await loadAll()
})
</script>
