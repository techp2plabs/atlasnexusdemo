<template>
  <div class="space-y-6">
    <!-- Error banner for failed state -->
    <div v-if="report.status === 'failed'" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-start gap-3">
        <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-300">Report failed</p>
          <p v-if="report.error_message" class="mt-1 text-sm text-red-700 dark:text-red-400">{{ report.error_message }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Report Setup</h2>
          <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Edit the campaign details and URLs, then re-run to replace the current data.
          </p>
        </div>
        <button
          v-if="!editing"
          @click="startEdit"
          class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Edit
        </button>
      </div>

      <!-- Read-only view -->
      <template v-if="!editing">
        <dl class="space-y-5">
          <div v-if="report.brand_name">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Brand Name</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ report.brand_name }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Name</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ report.campaign_name }}</dd>
          </div>
          <div v-if="report.period_start">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Period</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatPeriodDate(report.period_start) }} – {{ formatPeriodDate(report.period_end) }}</dd>
          </div>
          <div v-if="report.video_urls.length">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Video URLs ({{ filteredVideoUrls.length }} of {{ report.video_urls.length }})
              </dt>
              <input
                v-model="urlSearchQuery"
                type="text"
                placeholder="Search video URL..."
                class="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <dd class="mt-2 space-y-1">
              <div
                v-for="url in filteredVideoUrls"
                :key="url"
                class="rounded bg-gray-50 px-3 py-1.5 font-mono text-xs dark:bg-gray-800"
              >
                <a :href="url" target="_blank" rel="noopener noreferrer"
                  class="truncate text-purple-600 hover:underline dark:text-purple-400" @click.stop>{{ url }}</a>
              </div>
              <p v-if="!filteredVideoUrls.length" class="px-3 py-2 text-xs text-gray-400">No video URLs match your search.</p>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(report.created_at) }}</dd>
          </div>
        </dl>
      </template>

      <!-- Edit form -->
      <template v-else>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name <span class="text-red-500">*</span></label>
            <input
              v-model="form.brand_name"
              type="text"
              placeholder="e.g. Nike, Samsung"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name <span class="text-red-500">*</span></label>
            <input
              v-model="form.campaign_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Start <span class="text-red-500">*</span></label>
              <input
                v-model="form.period_start"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End <span class="text-red-500">*</span></label>
              <input
                v-model="form.period_end"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <p v-if="periodEndBeforeStart" class="text-xs text-red-600 dark:text-red-400">⚠ Period end must be on or after period start</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              YouTube Video URLs <span class="text-red-500">*</span>
              <span class="ml-1 text-xs text-gray-400">(one per line, max {{ videoUrlLimit ?? 50 }})</span>
            </label>
            <textarea
              v-model="form.urlsText"
              rows="7"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ parsedVideoCount }} video URL{{ parsedVideoCount !== 1 ? 's' : '' }} detected · Channels are derived automatically from videos
            </p>
          </div>

          <div v-if="formError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {{ formError }}
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              @click="save"
              :disabled="saving"
              class="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ saving ? 'Running...' : 'Save & Run' }}
            </button>
            <button
              @click="cancelEdit"
              :disabled="saving"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CampaignReport } from '~/composables/useCampaignReport'
import { parseVideoUrls } from '~/composables/useCampaignReport'

const props = defineProps<{ report: CampaignReport; videoUrlLimit?: number }>()
const emit = defineEmits<{ rerun: [report: CampaignReport] }>()

const { updateReport } = useCampaignReport()

const editing = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const form = reactive({ brand_name: '', campaign_name: '', period_start: '', period_end: '', urlsText: '' })
const urlSearchQuery = ref('')

const parsedVideoCount = computed(() => parseVideoUrls(form.urlsText).length)

const filteredVideoUrls = computed(() => {
  const q = urlSearchQuery.value.trim().toLowerCase()
  if (!q) return props.report.video_urls
  return props.report.video_urls.filter((url) => url.toLowerCase().includes(q))
})

const periodEndBeforeStart = computed(() =>
  form.period_start && form.period_end && form.period_end < form.period_start
)

const startEdit = () => {
  form.brand_name = props.report.brand_name || ''
  form.campaign_name = props.report.campaign_name
  form.period_start = props.report.period_start || ''
  form.period_end = props.report.period_end || ''
  form.urlsText = props.report.video_urls.join('\n')
  formError.value = null
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  formError.value = null
}

const save = async () => {
  formError.value = null
  const videoUrls = parseVideoUrls(form.urlsText)

  if (!form.brand_name.trim()) { formError.value = 'Brand name is required'; return }
  if (!form.campaign_name.trim()) { formError.value = 'Campaign name is required'; return }
  if (!form.period_start) { formError.value = 'Period start is required'; return }
  if (!form.period_end) { formError.value = 'Period end is required'; return }
  if (form.period_end < form.period_start) { formError.value = 'Period end must be on or after period start'; return }
  if (videoUrls.length === 0) { formError.value = 'At least one video URL is required'; return }
  const limit = props.videoUrlLimit ?? 50
  if (videoUrls.length > limit) { formError.value = `Maximum ${limit} video URLs allowed`; return }

  saving.value = true
  try {
    const updated = await updateReport(props.report.id, {
      brand_name: form.brand_name.trim(),
      campaign_name: form.campaign_name.trim(),
      video_urls: videoUrls,
      period_start: form.period_start,
      period_end: form.period_end,
    })
    editing.value = false
    emit('rerun', updated)
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to update report'
  } finally {
    saving.value = false
  }
}

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return d }
}

const formatPeriodDate = (d: string | null | undefined) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}
</script>
