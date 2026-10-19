<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12">
      <h1 class="text-2xl font-bold text-foreground dark:text-white">Creator Suites</h1>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Research your channel, review your content, and share clear results with brand partners.</p>
    </div>

    <section class="col-span-12 overflow-hidden rounded-xl border border-brand-100 bg-accent px-6 py-6 sm:px-8 md:flex md:min-h-[210px] md:items-center md:justify-between" aria-labelledby="creator-suites-banner-title">
      <div class="max-w-xl">
        <p class="text-sm font-medium text-brand-700">Creator workspace</p>
        <h2 id="creator-suites-banner-title" class="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">See what your content delivers.</h2>
        <p class="mt-2 max-w-lg text-sm leading-relaxed text-gray-600">Review your channel, report brand deals, and research creators in one place.</p>
        <a href="#tool-catalog" class="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Explore tools</a>
      </div>
      <div class="mt-5 hidden h-36 w-64 flex-shrink-0 items-center justify-center md:flex" aria-hidden="true">
        <svg viewBox="0 0 256 144" class="h-full w-full" fill="none">
          <circle cx="175" cy="72" r="65" fill="#DCD0F4"/>
          <circle cx="175" cy="72" r="48" stroke="#C5B4EA" stroke-width="2"/>
          <rect x="36" y="28" width="112" height="78" rx="12" fill="white"/>
          <rect x="49" y="41" width="30" height="24" rx="6" fill="#EEE8FA"/>
          <path d="M61 47v12l10-6-10-6Z" fill="#7250CE"/>
          <rect x="88" y="45" width="46" height="6" rx="3" fill="#DCD0F4"/>
          <rect x="88" y="57" width="36" height="5" rx="2.5" fill="#EEE8FA"/>
          <rect x="65" y="78" width="70" height="5" rx="2.5" fill="#EEE8FA"/>
          <rect x="139" y="82" width="94" height="48" rx="12" fill="white"/>
          <path d="M157 104h12l7-8 9 14 8-9h23" stroke="#7250CE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="col-span-12 flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          <button @click="load" class="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300">
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Tool catalog -->
    <div v-else id="tool-catalog" class="col-span-12">
      <div v-if="!tools.length" class="flex flex-col items-center justify-center py-20 text-center">
        <svg class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <p class="text-sm font-medium text-foreground dark:text-white">No Creator Suites available</p>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Creator Suites will appear here once they are activated by an administrator</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="tool in enrichedTools"
        :key="tool.id"
        :to="tool.route"
        class="group flex min-h-full w-full flex-col items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
      >
        <!-- Icon -->
        <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground dark:bg-brand-900/30 dark:text-brand-400">
          <svg v-html="tool.iconPaths" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></svg>
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-semibold text-foreground dark:text-white">{{ tool.name }}</h2>

          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ tool.pitch }}</p>

          <!-- Feature highlights -->
          <ul class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <li
              v-for="feature in tool.features.slice(0, 3)"
              :key="feature"
              class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
            >
              <svg class="h-3.5 w-3.5 flex-shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature }}
            </li>
          </ul>
        </div>

        <!-- CTA -->
        <div class="mt-auto flex w-full justify-end pt-2">
          <span class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors group-hover:bg-brand-700">
            Open tool
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </NuxtLink>
      </div>
    </div>

    <section v-if="recentReports.length" class="col-span-12 rounded-xl border border-border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900" aria-labelledby="recent-creator-reports-title">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div><h2 id="recent-creator-reports-title" class="text-lg font-semibold text-foreground dark:text-white">Recent reports</h2><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Pick up where you left off.</p></div>
        <NuxtLink to="/app/home" class="text-sm font-medium text-accent-foreground hover:underline">View all</NuxtLink>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <NuxtLink v-for="report in recentReports" :key="`${report.tool_slug}-${report.id}`" :to="`/app/creator-suites/${report.tool_slug}/${report.id}`" class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div class="min-w-0"><p class="truncate text-sm font-medium text-foreground dark:text-white">{{ report.title }}</p><p class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{{ report.tool_name }} · Created {{ formatRecentDate(report.created_at) }}</p></div>
          <span :class="recentStatusClass(report.status)" class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium">{{ recentStatusLabel(report.status) }}</span>
        </NuxtLink>
      </div>
    </section>
    <section v-else-if="summaryLoaded && !summaryError" class="col-span-12 rounded-xl border border-dashed border-border p-5 dark:border-gray-800">
      <h2 class="text-base font-semibold text-foreground dark:text-white">Your reports will appear here</h2><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a report from any tool to keep it easy to find.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator', 'creator'],
})

const { get } = useApi()
const { data: summary, error: summaryError, fetch: fetchSummary } = useCreatorSuitesSummary()
const summaryLoaded = ref(false)
const recentReports = computed(() => (summary.value?.recent_reports ?? []).slice(0, 5))
const formatRecentDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const recentStatusLabel = (status: string) => ({ pending: 'Pending', processing: 'Processing', completed: 'Completed', failed: 'Failed' }[status] || status)
const recentStatusClass = (status: string) => ({ completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300')

interface ToolItem {
  id: string
  slug: string
  name: string
  description: string | null
  scope: string
  status: string
  video_url_limit: number
}

const tools = ref<ToolItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'Creator Suites' },
]

const brandDealLimitLabel = (tool: ToolItem): string =>
  `Up to ${tool.video_url_limit ?? 50} YouTube videos per report`

const TOOL_META: Record<string, { route: string; pitch: string; features: (tool: ToolItem) => string[]; iconPaths: string }> = {
  'youtube-brand-deal-report': {
    route: '/app/creator-suites/youtube-brand-deal-report',
    pitch: 'Show a brand what sponsored videos delivered with one shareable performance report.',
    features: (tool) => [brandDealLimitLabel(tool), 'Views and engagement by video', 'Export a report to Excel'],
    iconPaths: `
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
      <path d="M9 12h.01M12 12h.01" stroke-width="2"/>
    `,
  },
  'youtube-channel-report': {
    route: '/app/creator-suites/youtube-channel-report',
    pitch:
      'Review your channel videos, spot your strongest content, and share a clear performance report.',
    features: (tool) => [brandDealLimitLabel(tool), 'Views and engagement by video', 'Export a report to Excel'],
    iconPaths: `
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
      <path d="M9 12h.01M12 12h.01" stroke-width="2"/>
    `,
  },
  'youtube-channel-profiling': {
    route: '/app/creator-suites/youtube-channel-profiling',
    pitch: 'Build a searchable shortlist from public YouTube channel data for research and collaboration.',
    features: () => ['Public channel metrics and topics', 'Search and sort imported channels', 'Refresh data and export to Excel'],
    iconPaths: `
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
    `,
  },
}

const enrichedTools = computed(() =>
  tools.value.map((tool) => {
    const meta = TOOL_META[tool.slug]
    return {
      ...tool,
      route: meta?.route ?? '/app/creator-suites',
      pitch: meta?.pitch ?? tool.description ?? 'No description available.',
      features: meta?.features ? meta.features(tool) : [],
      iconPaths: meta?.iconPaths ?? '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    }
  })
)

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await get<ToolItem[]>('/api/v1/tools')
    tools.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Failed to load tools'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), fetchSummary()])
  summaryLoaded.value = true
})
</script>
