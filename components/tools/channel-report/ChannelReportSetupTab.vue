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
            Edit coverage and period, then re-run to replace the current data.
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
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Report Name</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ report.report_name }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Coverage</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <span v-if="isLegacyReport">Legacy report (video URLs)</span>
              <span v-else-if="report.selection_mode === 'mcn'">By MCN</span>
              <span v-else>By Channel ({{ report.selected_channel_ids.length }} selected)</span>
            </dd>
          </div>
          <div v-if="report.period_start">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Report Month</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <template v-if="formatPeriodMonth(report.period_start) === formatPeriodMonth(report.period_end)">{{ formatPeriodMonth(report.period_start) }}</template>
              <template v-else>{{ formatPeriodDate(report.period_start) }} – {{ formatPeriodDate(report.period_end) }}</template>
            </dd>
          </div>
          <div v-if="!isLegacyReport && report.auto_resolved_video_count !== null">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Videos Used</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              <template v-if="report.include_manual_video_urls && report.video_urls.length > report.auto_resolved_video_count">
                {{ report.auto_resolved_video_count }} auto-detected + {{ report.video_urls.length - report.auto_resolved_video_count }} manual (unique) = {{ report.video_urls.length }} total
              </template>
              <template v-else>
                {{ report.auto_resolved_video_count }} auto-detected
              </template>
            </dd>
          </div>

          <div>
            <dt class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Attachments</dt>
            <dd class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <a
                  v-if="report.additional_data_file_url"
                  :href="report.additional_data_file_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-gray-50 dark:border-gray-700 dark:text-purple-400 dark:hover:bg-gray-800"
                >
                  Additional Data: {{ report.additional_data_file_name || 'download' }}
                </a>
                <span v-else class="text-xs text-gray-400 dark:text-gray-500">No Additional Data file attached</span>
                <label class="cursor-pointer text-xs font-medium text-purple-600 hover:underline dark:text-purple-400">
                  {{ report.additional_data_file_url ? 'Replace' : 'Upload' }}
                  <input type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="onUploadFile($event, 'additional')" />
                </label>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <a
                  v-if="report.youtube_shopping_data_file_url"
                  :href="report.youtube_shopping_data_file_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-gray-50 dark:border-gray-700 dark:text-purple-400 dark:hover:bg-gray-800"
                >
                  YouTube Shopping Data: {{ report.youtube_shopping_data_file_name || 'download' }}
                </a>
                <span v-else class="text-xs text-gray-400 dark:text-gray-500">No YouTube Shopping Data file attached</span>
                <label class="cursor-pointer text-xs font-medium text-purple-600 hover:underline dark:text-purple-400">
                  {{ report.youtube_shopping_data_file_url ? 'Replace' : 'Upload' }}
                  <input type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="onUploadFile($event, 'shopping')" />
                </label>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500">Attachments are stored for reference/download only in this release — not yet analyzed.</p>
            </dd>
          </div>

          <div v-if="isLegacyReport && report.video_urls.length">
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Name <span class="text-red-500">*</span></label>
            <input
              v-model="form.reportName"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coverage <span class="text-red-500">*</span></label>
            <ChannelReportCoveragePicker
              v-model:selection-mode="form.selectionMode"
              v-model:mcn-id="form.mcnId"
              v-model:channel-ids="form.channelIds"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Month <span class="text-red-500">*</span></label>
            <ChannelReportPeriodPicker
              v-model:month="form.periodMonth"
              v-model:year="form.periodYear"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Manual Video URLs <span class="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              v-model="form.manualVideoUrlsText"
              rows="3"
              placeholder="One YouTube video URL per line"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
            <label class="mt-2 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input
                v-model="form.includeManualVideoUrls"
                type="checkbox"
                class="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800"
              />
              <span>
                Include manual video URLs in calculation — merges the URLs above with the automatically detected videos for this coverage/period (duplicates removed).
              </span>
            </label>
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {{ form.includeManualVideoUrls
                ? 'These URLs will be combined with the automatically detected videos for the selected coverage and period.'
                : 'Videos are normally fetched automatically for the selected coverage and period. Left unchecked, these URLs are only used as a fallback if that comes up empty (e.g. no uploads that month).' }}
              <span v-if="isLegacyReport">This report's original video list has been pre-filled below — clear it if you want it to fetch automatically instead.</span>
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
import type { ChannelReport, ChannelReportSelectionMode } from '~/composables/useChannelReport'
import { firstDayOfMonth, lastDayOfMonth, parseVideoUrls } from '~/composables/useChannelReport'
import ChannelReportCoveragePicker from '~/components/tools/channel-report/ChannelReportCoveragePicker.vue'
import ChannelReportPeriodPicker from '~/components/tools/channel-report/ChannelReportPeriodPicker.vue'

const props = defineProps<{ report: ChannelReport; videoUrlLimit?: number }>()
const emit = defineEmits<{ rerun: [report: ChannelReport] }>()

const { updateReport, uploadAdditionalData, uploadShoppingData } = useChannelReport()
const { success: showSuccessToast, error: showErrorToast } = useToast()

const editing = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const urlSearchQuery = ref('')

// A report created under the pre-this-release video-URL flow: `selection_mode`
// defaults to 'channel' with an empty `selected_channel_ids` for those rows —
// still rendered/edited via the legacy video_urls view, never migrated.
const isLegacyReport = computed(
  () => props.report.selection_mode === 'channel' && props.report.selected_channel_ids.length === 0 && props.report.video_urls.length > 0,
)

const now = new Date()
const form = reactive({
  reportName: '',
  selectionMode: 'channel' as ChannelReportSelectionMode,
  mcnId: null as string | null,
  channelIds: [] as string[],
  periodMonth: now.getMonth() + 1,
  periodYear: now.getFullYear(),
  manualVideoUrlsText: '',
  includeManualVideoUrls: false,
})

// A Channel Report always covers exactly one calendar month.
const periodStart = computed(() => firstDayOfMonth(form.periodYear, form.periodMonth))
const periodEnd = computed(() => lastDayOfMonth(form.periodYear, form.periodMonth))

const filteredVideoUrls = computed(() => {
  const q = urlSearchQuery.value.trim().toLowerCase()
  if (!q) return props.report.video_urls
  return props.report.video_urls.filter((url) => url.toLowerCase().includes(q))
})

const parseYearMonth = (iso: string | null | undefined): { year: number; month: number } | null => {
  if (!iso) return null
  const [y, m] = iso.split('-')
  const year = Number(y)
  const month = Number(m)
  if (!year || !month) return null
  return { year, month }
}

const startEdit = () => {
  form.reportName = props.report.report_name
  form.selectionMode = props.report.selection_mode
  form.mcnId = props.report.selected_mcn_id
  form.channelIds = [...props.report.selected_channel_ids]

  // A report always covers one calendar month; if an older report somehow
  // spans more than one (pre-simplification), only its start month carries
  // forward into the now-single-month picker.
  const start = parseYearMonth(props.report.period_start)
  if (start) { form.periodMonth = start.month; form.periodYear = start.year }

  // Legacy reports (pre-MCN/Channel-flow, driven entirely by a manually-pasted
  // video list, predating the manual_video_urls column) have no selected
  // channel/MCN to derive videos from — carry their existing video_urls into
  // the field so re-running doesn't silently lose them. Every other report
  // pre-fills from manual_video_urls, which persists exactly what the user
  // typed independently of whatever video_urls resolved to (auto-only,
  // manual-fallback, or merged) — see the model's doc-comment.
  form.manualVideoUrlsText = isLegacyReport.value
    ? props.report.video_urls.join('\n')
    : props.report.manual_video_urls.join('\n')
  form.includeManualVideoUrls = props.report.include_manual_video_urls

  formError.value = null
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  formError.value = null
}

const save = async () => {
  formError.value = null

  if (!form.reportName.trim()) { formError.value = 'Report name is required'; return }
  if (form.selectionMode === 'mcn' && !form.mcnId) { formError.value = 'Please select an MCN'; return }
  if (form.selectionMode === 'channel' && form.channelIds.length === 0) { formError.value = 'Please select at least one channel'; return }

  saving.value = true
  try {
    const updated = await updateReport(props.report.id, {
      report_name: form.reportName.trim(),
      selection_mode: form.selectionMode,
      mcn_id: form.selectionMode === 'mcn' ? form.mcnId : null,
      channel_ids: form.selectionMode === 'channel' ? form.channelIds : [],
      period_start: periodStart.value,
      period_end: periodEnd.value,
      video_urls: parseVideoUrls(form.manualVideoUrlsText),
      include_manual_video_urls: form.includeManualVideoUrls,
    })
    editing.value = false
    emit('rerun', updated)
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to update report'
  } finally {
    saving.value = false
  }
}

const onUploadFile = async (event: Event, kind: 'additional' | 'shopping') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
    showErrorToast('Only .csv, .xlsx, or .xls files are accepted')
    target.value = ''
    return
  }

  try {
    const result = kind === 'additional'
      ? await uploadAdditionalData(props.report.id, file)
      : await uploadShoppingData(props.report.id, file)
    if (kind === 'additional') {
      props.report.additional_data_file_url = result.file_url
      props.report.additional_data_file_name = result.file_name
    } else {
      props.report.youtube_shopping_data_file_url = result.file_url
      props.report.youtube_shopping_data_file_name = result.file_name
    }
    showSuccessToast('File uploaded successfully')
  } catch (e: any) {
    showErrorToast(e?.response?.data?.detail || 'Failed to upload file')
  } finally {
    target.value = ''
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

const formatPeriodMonth = (d: string | null | undefined) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) }
  catch { return d }
}
</script>
