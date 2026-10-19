<template>
  <div class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="col-span-12 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground dark:text-white">YouTube Brand Deal Report</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Fetch YouTube video metrics and generate brand deal reports</p>
      </div>
      <button
        @click="showNewReportModal = true"
        class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        + New Report
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error && !loading" class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          <button @click="load" class="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300">
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Active/Archived tabs (admin only) -->
    <div v-if="authStore.isAdmin" class="col-span-12">
      <Tabs v-model="statusFilter" :tabs="statusTabs" />
    </div>

    <!-- Search -->
    <div class="col-span-12">
      <form @submit.prevent="applySearch" class="flex max-w-sm items-center gap-2">
        <div class="relative flex-1">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search by campaign or brand name..."
            class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            v-if="searchInput"
            type="button"
            @click="clearSearch"
            aria-label="Clear search"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          :disabled="searchInput.trim() === searchQuery"
          class="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply
        </button>
      </form>
    </div>

    <!-- Reports table -->
    <div class="col-span-12">
      <div class="rounded-lg border border-border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div v-if="loading && !reports" class="flex items-center justify-center py-16">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent"></div>
        </div>

        <div v-else-if="!reports?.items?.length" class="flex flex-col items-center justify-center py-16 text-center">
          <svg class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <template v-if="searchQuery">
            <p class="text-sm font-medium text-foreground dark:text-white">No reports match "{{ searchQuery }}"</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Try a different campaign or brand name</p>
          </template>
          <template v-else>
            <p class="text-sm font-medium text-foreground dark:text-white">No reports yet</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first campaign report to get started</p>
            <button
              @click="showNewReportModal = true"
              class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + New Report
            </button>
          </template>
        </div>

        <!-- Period-in-progress banner -->
        <div
          v-if="reports?.items?.some((r) => r.period_in_progress)"
          class="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300"
        >
          Some reports cover a period that hasn't ended yet — figures may be incomplete. Review before sending to clients.
        </div>

        <table v-if="reports?.items?.length" class="w-full text-sm">
          <thead>
            <tr class="border-b border-border dark:border-gray-800">
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Campaign Name</th>
              <th v-if="showOwnerColumn" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Owner</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Videos</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Period</th>
              <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr
              v-for="report in reports.items"
              :key="report.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              @click="router.push(`/app/creator-suites/youtube-brand-deal-report/${report.id}`)"
            >
              <td class="px-6 py-4 font-medium text-foreground dark:text-white">{{ report.campaign_name }}</td>
              <td v-if="showOwnerColumn" class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ report.owner_email || '—' }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ report.brand_name || '—' }}</td>
              <td class="px-6 py-4">
                <span :class="statusBadgeClass(report.status)">{{ statusLabel(report.status) }}</span>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ report.video_count }}</td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                <span v-if="report.period_start" class="inline-flex items-center gap-1">
                  {{ formatPeriodShort(report.period_start) }} – {{ formatPeriodShort(report.period_end) }}
                  <span
                    v-if="report.period_in_progress"
                    class="ml-1 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    title="Campaign period includes today — data may still be incomplete"
                  >⚠</span>
                </span>
                <span v-else>—</span>
              </td>
              <td class="px-6 py-4 text-gray-600 dark:text-gray-400">{{ formatDate(report.created_at) }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/app/creator-suites/youtube-brand-deal-report/${report.id}`"
                    class="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400"
                    @click.stop
                  >
                    View
                  </NuxtLink>
                  <button
                    v-if="statusFilter === 'archived'"
                    @click.stop="handleRestore(report)"
                    class="rounded bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                  >
                    Restore
                  </button>
                  <button
                    v-else
                    @click.stop="handleDelete(report)"
                    class="rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="reports && reports.total_pages > 1"
          class="flex items-center justify-between border-t border-border px-6 py-3 dark:border-gray-800"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Page {{ reports.page }} of {{ reports.total_pages }} ({{ reports.total }} total)
          </p>
          <div class="flex gap-2">
            <button
              :disabled="page === 1"
              @click="changePage(page - 1)"
              class="rounded border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Prev
            </button>
            <button
              :disabled="page >= reports.total_pages"
              @click="changePage(page + 1)"
              class="rounded border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Report Modal -->
    <Modal
      :isOpen="showNewReportModal"
      title="New YouTube Brand Deal Report"
      size="lg"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.brand_name"
            type="text"
            placeholder="e.g. Nike, Samsung"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.campaign_name"
            type="text"
            placeholder="e.g. Q2 2026 Brand Awareness"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Start <span class="text-red-500">*</span></label>
            <input
              v-model="form.period_start"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End <span class="text-red-500">*</span></label>
            <input
              v-model="form.period_end"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <p v-if="periodEndBeforeStart" class="text-xs text-red-600 dark:text-red-400">⚠ Period end must be on or after period start</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            YouTube Video URLs <span class="text-red-500">*</span>
            <span class="ml-1 text-xs text-gray-400">(one per line, max {{ videoUrlLimit }})</span>
          </label>
          <textarea
            v-model="form.urlsText"
            rows="5"
            placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/...&#10;https://www.youtube.com/shorts/..."
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ parsedUrlCount }} video URL{{ parsedUrlCount !== 1 ? 's' : '' }} detected · Channels are derived automatically from videos
          </p>
        </div>
        <div v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {{ formError }}
        </div>
      </div>

      <template #footer>
        <button @click="closeModal" class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
          Cancel
        </button>
        <button
          @click="submitReport"
          :disabled="submitting"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Creating...' : 'Create Report' }}
        </button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal :isOpen="isDeleteModalOpen" @close="handleDeleteModalClose" title="Delete Report" size="sm">
      <div class="mt-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{{ selectedReport?.campaign_name }}"? The report will be archived and can be restored later.
        </p>
        <p v-if="deleteError" class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {{ deleteError }}
        </p>
      </div>
      <template #footer>
        <div class="flex w-full items-center justify-end gap-3">
          <button
            @click="handleDeleteModalClose"
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            type="button"
            :disabled="deleting"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/common/Breadcrumb.vue'
import Modal from '~/components/ui/Modal.vue'
import Tabs from '~/components/common/Tabs.vue'
import type { BreadcrumbItem } from '~/components/common/Breadcrumb.vue'
import { useCampaignReport, parseVideoUrls, type CampaignReportListItem } from '~/composables/useCampaignReport'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin', 'mcn_operator', 'creator'],
})

const route = useRoute()
const router = useRouter()
const { get } = useApi()
const authStore = useAuthStore()
const { success: showSuccessToast } = useToast()
const { loading, error, fetchReports, createReport, deleteReport, restoreReport } = useCampaignReport()
const videoUrlLimit = ref(50)

const reports = ref<Awaited<ReturnType<typeof fetchReports>> | null>(null)
const page = ref(Number(route.query.page) > 0 ? Number(route.query.page) : 1)
const showNewReportModal = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

const statusTabs = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
]
const statusFilter = ref<string>(
  route.query.status === 'archived' ? 'archived' : 'active'
)

const searchQuery = ref<string>(typeof route.query.q === 'string' ? route.query.q : '')
const searchInput = ref<string>(searchQuery.value)

const isDeleteModalOpen = ref(false)
const selectedReport = ref<CampaignReportListItem | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const form = reactive({ brand_name: '', campaign_name: '', period_start: '', period_end: '', urlsText: '' })

const parsedUrlCount = computed(() => parseVideoUrls(form.urlsText).length)

const showOwnerColumn = computed(() => reports.value?.items?.some((r) => r.owner_email) ?? false)

const periodEndBeforeStart = computed(() =>
  form.period_start && form.period_end && form.period_end < form.period_start
)

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', to: '/app/home' },
  { label: 'Creator Suites', to: '/app/creator-suites' },
  { label: 'YouTube Brand Deal Report' },
]

const load = async () => {
  try {
    reports.value = await fetchReports(
      page.value,
      20,
      statusFilter.value as 'active' | 'archived',
      searchQuery.value || undefined
    )
  } catch {
    // error is reactive from composable
  }
}

const syncQuery = () => {
  const query: Record<string, string> = { ...(route.query as Record<string, string>) }
  if (searchQuery.value) query.q = searchQuery.value
  else delete query.q
  if (statusFilter.value !== 'active') query.status = statusFilter.value
  else delete query.status
  if (page.value > 1) query.page = String(page.value)
  else delete query.page
  router.replace({ query })
}

const changePage = async (newPage: number) => {
  page.value = newPage
  syncQuery()
  await load()
}

const applySearch = () => {
  searchQuery.value = searchInput.value.trim()
}

const clearSearch = () => {
  searchInput.value = ''
  searchQuery.value = ''
}

watch([statusFilter, searchQuery], async () => {
  page.value = 1
  syncQuery()
  await load()
})

const handleDelete = (report: CampaignReportListItem) => {
  selectedReport.value = report
  deleteError.value = null
  isDeleteModalOpen.value = true
}

const handleDeleteModalClose = () => {
  isDeleteModalOpen.value = false
  selectedReport.value = null
  deleteError.value = null
}

const confirmDelete = async () => {
  if (!selectedReport.value) return

  deleting.value = true
  deleteError.value = null
  try {
    await deleteReport(selectedReport.value.id)
    showSuccessToast('Report deleted successfully')
    isDeleteModalOpen.value = false
    selectedReport.value = null
    await load()
  } catch (e: any) {
    deleteError.value = e?.response?.data?.detail || 'Failed to delete report'
  } finally {
    deleting.value = false
  }
}

const handleRestore = async (report: CampaignReportListItem) => {
  try {
    await restoreReport(report.id)
    showSuccessToast('Report restored successfully')
    await load()
  } catch {
    // error is reactive from composable
  }
}

const closeModal = () => {
  showNewReportModal.value = false
  form.brand_name = ''
  form.campaign_name = ''
  form.period_start = ''
  form.period_end = ''
  form.urlsText = ''
  formError.value = null
}

const submitReport = async () => {
  formError.value = null
  const videoUrls = parseVideoUrls(form.urlsText)

  if (!form.brand_name.trim()) { formError.value = 'Brand name is required'; return }
  if (!form.campaign_name.trim()) { formError.value = 'Campaign name is required'; return }
  if (!form.period_start) { formError.value = 'Period start is required'; return }
  if (!form.period_end) { formError.value = 'Period end is required'; return }
  if (form.period_end < form.period_start) { formError.value = 'Period end must be on or after period start'; return }
  if (videoUrls.length === 0) { formError.value = 'At least one video URL is required'; return }
  if (videoUrls.length > videoUrlLimit.value) { formError.value = `Maximum ${videoUrlLimit.value} video URLs allowed`; return }

  submitting.value = true
  try {
    const report = await createReport({
      brand_name: form.brand_name.trim(),
      campaign_name: form.campaign_name.trim(),
      video_urls: videoUrls,
      period_start: form.period_start,
      period_end: form.period_end,
    })
    closeModal()
    router.push(`/app/creator-suites/youtube-brand-deal-report/${report.id}`)
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to create report'
  } finally {
    submitting.value = false
  }
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }
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

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

const formatPeriodShort = (d: string | null | undefined) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

onMounted(async () => {
  await load()
  try {
    const res = await get<{ slug: string; video_url_limit: number }[]>('/api/v1/tools')
    const tool = res.data.find((t) => t.slug === 'youtube-brand-deal-report')
    if (tool) videoUrlLimit.value = tool.video_url_limit
  } catch {}
})
</script>
