<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Report file</label>
        <select
          v-model="filters.report_file_id"
          class="h-10 max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Default (newest)</option>
          <option v-for="file in reportFiles" :key="file.id" :value="file.id">
            {{ file.report_type }}-{{ file.youtube_report_id }}
          </option>
        </select>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          One entry per archived CSV. Default uses the newest processed file for this MCN and month.
        </p>
      </div>

      <div class="flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search video_id, asset_id, claim_id..."
          class="h-10 w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div class="self-end">
        <button
          @click="load"
          :disabled="loading"
          class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {{ loading ? 'Loading...' : 'Apply' }}
        </button>
      </div>
    </div>

    <!-- Source Info -->
    <div v-if="rawData?.report_file" class="text-sm text-gray-500 dark:text-gray-400">
      Source: {{ rawData.report_file.youtube_report_id }}
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && rawData && rawData.rows.length === 0" class="flex h-32 items-center justify-center text-gray-500 dark:text-gray-400">
      No raw data found for this selection.
    </div>

    <!-- Table -->
    <div v-else-if="rawData && rawData.rows.length > 0" class="overflow-x-auto rounded-lg border border-border dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="col in rawData.columns"
              :key="col"
              class="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          <tr v-for="(row, idx) in rawData.rows" :key="idx">
            <td
              v-for="col in rawData.columns"
              :key="col"
              class="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
            >
              {{ row[col] ?? '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="rawData && rawData.pagination.total_pages > 1" class="flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ (rawData.pagination.page - 1) * rawData.pagination.page_size + 1 }} -
        {{ Math.min(rawData.pagination.page * rawData.pagination.page_size, rawData.pagination.total_rows) }}
        of {{ rawData.pagination.total_rows }} rows
      </p>

      <div class="flex gap-2">
        <button
          @click="goToPage(rawData.pagination.page - 1)"
          :disabled="rawData.pagination.page <= 1"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        <button
          @click="goToPage(rawData.pagination.page + 1)"
          :disabled="rawData.pagination.page >= rawData.pagination.total_pages"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRevenueRawData, type RevenueRawDataResponse } from '~/composables/useRevenueRawData'

interface ReportFileInfo {
  id: string
  report_type: string
  youtube_report_id: string
  row_count: number | null
}

const props = defineProps<{
  channelId: string
  month: number | null
  reportFiles: ReportFileInfo[]
}>()

const { loading, error, fetchRawData } = useRevenueRawData()
const rawData = ref<RevenueRawDataResponse | null>(null)

const filters = reactive({
  report_file_id: '',
  search: '',
  page: 1,
})

const load = async () => {
  if (!props.month) {
    console.log('[RawDataTab] No month provided, skipping load')
    return
  }
  console.log('[RawDataTab] Loading raw data for channel:', props.channelId, 'month:', props.month)
  rawData.value = await fetchRawData(props.channelId, {
    month: props.month,
    report_file_id: filters.report_file_id || undefined,
    search: filters.search || undefined,
    page: filters.page,
    page_size: 50,
  })
  console.log('[RawDataTab] Raw data loaded:', rawData.value)
}

const goToPage = (page: number) => {
  filters.page = page
  load()
}

onMounted(() => {
  load()
})

watch(() => props.month, () => {
  filters.page = 1
  filters.report_file_id = ''
  load()
})

watch(
  () => props.reportFiles,
  (files) => {
    if (!files?.length) {
      filters.report_file_id = ''
      return
    }
    if (filters.report_file_id && !files.some((f) => f.id === filters.report_file_id)) {
      filters.report_file_id = ''
    }
  },
  { deep: true },
)
</script>
