<template>
  <div class="space-y-6">
    <!-- Not-yet-run precondition -->
    <div v-if="!reportReady" class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800/60 dark:bg-amber-950/30">
      <p class="text-sm font-medium text-amber-900 dark:text-amber-200">Run this report first to fetch comments</p>
      <p class="mt-1 text-xs text-amber-700 dark:text-amber-300/80">
        Comments are pulled per video, so the report needs to have completed at least one run.
      </p>
    </div>

    <!-- Loading initial status -->
    <div v-else-if="loadingStatus" class="flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
    </div>

    <!-- Fetch in progress -->
    <div v-else-if="isFetchInFlight" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      <p class="text-base font-medium text-gray-900 dark:text-white">Fetching comments from YouTube…</p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ latestRun?.videos_ok ?? 0 }}/{{ latestRun?.videos_total ?? '?' }} videos processed. This can take a while for reports with many videos.
      </p>
    </div>

    <!-- Never fetched -->
    <div v-else-if="!latestRun" class="mx-auto max-w-sm py-12 text-center">
      <p class="text-base font-medium text-gray-900 dark:text-white">Fetch raw comment data</p>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Pull every comment (and reply) from YouTube for this report's videos and store it for review and future analysis.
      </p>
      <button
        type="button"
        @click="handleFetch"
        class="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
      >
        Fetch Comments
      </button>
    </div>

    <!-- Failed with nothing fetched -->
    <div v-else-if="latestRun.status === 'failed' && totalComments === 0" class="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
      <p class="text-sm font-semibold text-red-800 dark:text-red-300">Comment fetch failed</p>
      <p v-if="latestRun.error_message" class="mt-1 text-sm text-red-700 dark:text-red-400">{{ latestRun.error_message }}</p>
      <button
        type="button"
        @click="handleFetch"
        class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Retry
      </button>
    </div>

    <!-- Data view -->
    <div v-else class="space-y-4">
      <!-- Fetch-run summary (admin-only fields; backend only ever returns this endpoint to admins) -->
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
        <div class="flex flex-wrap items-center gap-3">
          <span :class="runStatusBadgeClass(latestRun.status)">{{ runStatusLabel(latestRun.status) }}</span>
          <span>{{ latestRun.videos_ok }}/{{ latestRun.videos_total }} videos fetched</span>
          <span v-if="latestRun.videos_failed">· {{ latestRun.videos_failed }} video(s) failed</span>
          <span>· {{ latestRun.comments_fetched }} comments in last run</span>
          <span>· Last run {{ formatDate(latestRun.completed_at || latestRun.started_at) }}</span>
        </div>
        <button
          type="button"
          @click="handleFetch"
          :disabled="fetching"
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Refresh comments
        </button>
      </div>

      <div v-if="Object.keys(latestRun.failure_details).length" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
        <p class="font-medium">Some videos could not be fetched:</p>
        <ul class="mt-1 list-inside list-disc">
          <li v-for="(reason, videoId) in latestRun.failure_details" :key="videoId">{{ videoId }}: {{ reason }}</li>
        </ul>
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ total }} comment{{ total !== 1 ? 's' : '' }}</p>
        <div class="flex items-center gap-2">
          <select
            v-model="videoFilter"
            class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">All videos</option>
            <option v-for="v in videoOptions" :key="v.video_id" :value="v.video_id">{{ v.title }}</option>
          </select>
          <select
            v-model="sort"
            class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="published_at_desc">Newest first</option>
            <option value="published_at_asc">Oldest first</option>
            <option value="like_count_desc">Most liked</option>
          </select>
        </div>
      </div>

      <!-- Comments table -->
      <div v-if="loadingComments" class="flex items-center justify-center py-12">
        <div class="h-6 w-6 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
      </div>
      <div v-else class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table class="w-full min-w-[800px] text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Author</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Comment</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Likes</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Replies</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Published</th>
            </tr>
          </thead>
          <tbody v-if="!comments.length">
            <tr>
              <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No comments found.</td>
            </tr>
          </tbody>
          <tbody v-else class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
            <tr v-for="comment in comments" :key="comment.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <td class="px-4 py-3 max-w-[160px] truncate text-gray-700 dark:text-gray-300">
                {{ comment.author_display_name || 'Unknown' }}
              </td>
              <td class="px-4 py-3 max-w-[420px]">
                <span v-if="comment.is_reply" class="mr-1 text-xs text-gray-400">↳ reply</span>
                <!-- text_display is YouTube's own pre-sanitized HTML (auto-linked URLs, escaped entities), not raw user input -->
                <span class="text-gray-800 dark:text-gray-200" v-html="comment.text_display || comment.text_original"></span>
              </td>
              <td class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{{ comment.like_count }}</td>
              <td class="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{{ comment.is_reply ? '—' : comment.reply_count }}</td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(comment.published_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between text-sm">
        <button
          type="button"
          @click="page > 1 && (page -= 1)"
          :disabled="page <= 1"
          class="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <span class="text-gray-500 dark:text-gray-400">Page {{ page }} of {{ totalPages }}</span>
        <button
          type="button"
          @click="page < totalPages && (page += 1)"
          :disabled="page >= totalPages"
          class="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CampaignReport } from '~/composables/useCampaignReport'
import {
  useCampaignReportComments,
  type CommentFetchRun,
  type CommentSort,
  type ReportComment,
} from '~/composables/useCampaignReportComments'

const props = defineProps<{ report: CampaignReport }>()

const { error: showError } = useToast()
const { triggerCommentsFetch, fetchComments, fetchCommentsFetchStatus } = useCampaignReportComments()

const reportReady = computed(
  () => props.report.status === 'completed' && (props.report.report_data?.videos?.length ?? 0) > 0,
)

const loadingStatus = ref(true)
const loadingComments = ref(false)
const fetching = ref(false)
const latestRun = ref<CommentFetchRun | null>(null)

const comments = ref<ReportComment[]>([])
const total = ref(0)
const totalComments = computed(() => latestRun.value?.comments_fetched ?? 0)
const page = ref(1)
const pageSize = 50
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 0)
const videoFilter = ref('')
const sort = ref<CommentSort>('published_at_desc')

const isFetchInFlight = computed(() => latestRun.value?.status === 'pending' || latestRun.value?.status === 'fetching')

let pollTimer: ReturnType<typeof setTimeout> | null = null

const videoOptions = computed(() => {
  const videos = props.report.report_data?.videos || []
  return videos.map((v) => ({ video_id: v.video_id, title: v.snippet.title || v.video_id }))
})

const runStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: 'Complete',
    partial_failure: 'Partial failure',
    failed: 'Failed',
    pending: 'Pending',
    fetching: 'Fetching…',
  }
  return map[status] || status
}

const runStatusBadgeClass = (status: string) => {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    partial_failure: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  return `${base} ${map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return d
  }
}

const loadStatus = async () => {
  if (!reportReady.value) {
    loadingStatus.value = false
    return
  }
  loadingStatus.value = true
  try {
    latestRun.value = await fetchCommentsFetchStatus(props.report.id)
    if (isFetchInFlight.value) {
      schedulePolling()
    } else if (latestRun.value && totalComments.value > 0) {
      await loadComments()
    }
  } catch (e: any) {
    showError(e?.response?.data?.detail || 'Failed to load comments status')
  } finally {
    loadingStatus.value = false
  }
}

const schedulePolling = () => {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = setTimeout(async () => {
    latestRun.value = await fetchCommentsFetchStatus(props.report.id)
    if (isFetchInFlight.value) {
      schedulePolling()
    } else if (latestRun.value && totalComments.value > 0) {
      await loadComments()
    }
  }, 3000)
}

const loadComments = async () => {
  loadingComments.value = true
  try {
    const result = await fetchComments(props.report.id, {
      videoId: videoFilter.value || undefined,
      page: page.value,
      pageSize,
      sort: sort.value,
    })
    comments.value = result.items
    total.value = result.total
  } catch (e: any) {
    showError(e?.response?.data?.detail || 'Failed to load comments')
  } finally {
    loadingComments.value = false
  }
}

const handleFetch = async () => {
  fetching.value = true
  try {
    latestRun.value = await triggerCommentsFetch(props.report.id)
    if (isFetchInFlight.value) {
      schedulePolling()
    } else {
      await loadComments()
    }
  } catch (e: any) {
    showError(e?.response?.data?.detail || 'Failed to fetch comments')
  } finally {
    fetching.value = false
  }
}

watch([videoFilter, sort], () => {
  page.value = 1
  if (latestRun.value && totalComments.value > 0) loadComments()
})

watch(page, () => {
  if (latestRun.value && totalComments.value > 0) loadComments()
})

onMounted(() => loadStatus())

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
})
</script>
