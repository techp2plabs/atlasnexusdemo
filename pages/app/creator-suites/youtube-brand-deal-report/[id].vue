<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !report" class="col-span-12 flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="fetchError && !report" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-800 dark:text-red-300">{{ fetchError }}</p>
          <NuxtLink to="/app/creator-suites/youtube-brand-deal-report" class="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300">
            Back to list
          </NuxtLink>
        </div>
      </div>
    </div>

    <template v-else-if="report">
      <!-- Page header -->
      <div class="col-span-12 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-foreground dark:text-white">{{ report.campaign_name }}</h1>
            <span :class="statusBadgeClass(report.status)">{{ statusLabel(report.status) }}</span>
            <span v-if="report.status === 'processing'" class="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <span class="h-3 w-3 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></span>
              Processing…
            </span>
          </div>
          <div v-if="report.brand_name || report.period_start" class="mt-1.5 flex flex-wrap items-center gap-2">
            <span v-if="report.brand_name" class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Brand: {{ report.brand_name }}
            </span>
            <span v-if="report.period_start" class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Period: {{ formatPeriodDate(report.period_start) }} – {{ formatPeriodDate(report.period_end) }}
            </span>
            <span v-if="report.owner_email" class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Owner: {{ report.owner_email }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Created {{ formatDate(report.created_at) }}
            <span v-if="report.report_data"> · Fetched {{ formatFetchedAt(report.report_data.fetched_at) }}</span>
          </p>
        </div>
        <button
          v-if="report.status === 'completed'"
          type="button"
          @click="activeTab = 'share'"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >Share report</button>
        <button
          type="button"
          title="Refresh YouTube data"
          @click="handleRefresh"
          :disabled="refreshing || report.status === 'processing'"
          class="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': refreshing || report.status === 'processing' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Tabs -->
      <div class="col-span-12">
        <Tabs :tabs="allTabs" v-model="activeTab" :key="allTabs.map(t=>t.id).join(',')">
          <template #overview>
            <div v-if="report.status === 'processing'" class="flex flex-col items-center justify-center py-20 text-center">
              <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
              <p class="text-base font-medium text-foreground dark:text-white">Fetching YouTube data…</p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">This usually takes a few seconds. The page will update automatically.</p>
            </div>
            <CampaignReportOverviewTab v-else-if="report.status === 'completed' && report.report_data" :report="report" :sheetsLoading="sheetsLoading" :pdfLoading="pdfLoading" @download="handleDownload" @sheets="handleSheets" @pdf="handlePdf" />
            <div v-else-if="report.status === 'failed'" class="py-8">
              <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                <p class="text-sm font-semibold text-red-800 dark:text-red-300">Report failed</p>
                <p v-if="report.error_message" class="mt-1 text-sm text-red-700 dark:text-red-400">{{ report.error_message }}</p>
                <button @click="activeTab = 'setup'" class="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-400">
                  Go to Setup to edit and retry
                </button>
              </div>
            </div>
          </template>

          <template #videos>
            <CampaignReportVideosTab
              v-if="report.status === 'completed' && report.report_data"
              :report="report"
            />
            <div v-else class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Videos will be available once the report is completed.
            </div>
          </template>

          <template #channels>
            <CampaignReportChannelsTab
              v-if="report.status === 'completed' && report.report_data"
              :report="report"
            />
            <div v-else class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Channels will be available once the report is completed.
            </div>
          </template>

          <template #comments>
            <CampaignReportCommentsTab :report="report" />
          </template>

          <template #insight>
            <CampaignReportInsightTab :report="report" />
          </template>

          <template #setup>
            <CampaignReportSetupTab :report="report" :video-url-limit="videoUrlLimit" @rerun="handleRerun" />
          </template>

          <template #share>
            <CampaignReportShareTab :report="report" />
          </template>
        </Tabs>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Tabs from '~/components/common/Tabs.vue'
import CampaignReportOverviewTab from '~/components/tools/campaign-report/CampaignReportOverviewTab.vue'
import CampaignReportVideosTab from '~/components/tools/campaign-report/CampaignReportVideosTab.vue'
import CampaignReportChannelsTab from '~/components/tools/campaign-report/CampaignReportChannelsTab.vue'
import CampaignReportInsightTab from '~/components/tools/campaign-report/CampaignReportInsightTab.vue'
import CampaignReportCommentsTab from '~/components/tools/campaign-report/CampaignReportCommentsTab.vue'
import CampaignReportSetupTab from '~/components/tools/campaign-report/CampaignReportSetupTab.vue'
import CampaignReportShareTab from '~/components/tools/campaign-report/CampaignReportShareTab.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import type { Tab } from '~/components/common/Tabs.vue'
import { useCampaignReport, type CampaignReport } from '~/composables/useCampaignReport'
const { get } = useApi()

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator', 'creator'],
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { fetchReport, refreshReport, downloadExcel, exportSheets, downloadPdf } = useCampaignReport()
const { error: showError } = useToast()

const report = ref<CampaignReport | null>(null)
const loading = ref(true)
const fetchError = ref<string | null>(null)
const videoUrlLimit = ref(50)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const activeTab = ref<string>((route.query.tab as string) || 'setup')

const allTabs = computed<Tab[]>(() => {
  const tabs: Tab[] = [{ id: 'overview', label: 'Overview' }]
  if (report.value?.video_urls?.length) tabs.push({ id: 'videos', label: 'Videos' })
  if (report.value?.report_data?.channels?.length) tabs.push({ id: 'channels', label: 'Channels' })
  if (authStore.isAdmin) tabs.push({ id: 'comments', label: 'Comments' })
  tabs.push({ id: 'insight', label: 'Insight' })
  tabs.push({ id: 'setup', label: 'Setup' })
  tabs.push({ id: 'share', label: 'Share' })
  return tabs
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: 'Home', to: '/app/home' },
  { label: 'Creator Suites', to: '/app/creator-suites' },
  { label: 'YouTube Brand Deal Report', to: '/app/creator-suites/youtube-brand-deal-report' },
  { label: report.value?.campaign_name || 'Loading…' },
])

const load = async (silent = false) => {
  if (!silent) loading.value = true
  fetchError.value = null
  try {
    const data = await fetchReport(route.params.id as string)
    const wasProcessing = report.value?.status === 'processing'
    report.value = data

    if (wasProcessing && data.status === 'completed') {
      activeTab.value = 'overview'
    }

    if (data.status === 'processing') {
      schedulePolling()
    }
  } catch (e: any) {
    fetchError.value = e?.response?.data?.detail || 'Failed to load report'
  } finally {
    loading.value = false
  }
}

const schedulePolling = () => {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = setTimeout(() => load(true), 2000)
}

const handleRerun = (updated: CampaignReport) => {
  report.value = updated
  activeTab.value = 'overview'
  schedulePolling()
}

const refreshing = ref(false)

const handleRefresh = async () => {
  if (!report.value || refreshing.value || report.value.status === 'processing') return
  refreshing.value = true
  try {
    const updated = await refreshReport(report.value.id)
    handleRerun(updated)
  } catch (e: any) {
    showError(e?.response?.data?.detail || 'Failed to refresh report')
  } finally {
    refreshing.value = false
  }
}

const sheetsLoading = ref(false)
const pdfLoading = ref(false)

const handleDownload = async () => {
  if (!report.value) return
  try {
    await downloadExcel(report.value.id, report.value.campaign_name)
  } catch {
    showError('Download failed')
  }
}

const handleSheets = async () => {
  if (!report.value) return
  sheetsLoading.value = true
  try {
    const url = await exportSheets(report.value.id)
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch {
    showError('Failed to create Google Sheet. Try the Excel export instead.')
  } finally {
    sheetsLoading.value = false
  }
}

const handlePdf = async () => {
  if (!report.value) return
  pdfLoading.value = true
  try {
    await downloadPdf(report.value.id, report.value.campaign_name)
  } catch {
    showError('PDF export failed')
  } finally {
    pdfLoading.value = false
  }
}

watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } })
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && allTabs.value.find((t) => t.id === newTab)) {
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

const formatFetchedAt = (d: string) => {
  try { return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return d }
}

const formatPeriodDate = (d: string | null | undefined) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

onMounted(async () => {
  await load()
  if (!route.query.tab && report.value) {
    activeTab.value = report.value.status === 'completed' ? 'overview' : 'setup'
  }
  try {
    const res = await get<{ slug: string; video_url_limit: number }[]>('/api/v1/tools')
    const tool = res.data.find((t) => t.slug === 'youtube-brand-deal-report')
    if (tool) videoUrlLimit.value = tool.video_url_limit
  } catch {}
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
})
</script>
