<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Scheduled Job Status</h3>
    <div v-if="!jobs.length" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
      No runs recorded
    </div>
    <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <div v-for="job in jobs" :key="job.fetch_request_id ?? job.last_run" class="py-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{{ job.job_name }}</p>
            <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {{ job.last_run ? formatDateTime(job.last_run) : '—' }}
              <span v-if="job.duration_seconds != null"> · {{ formatDuration(job.duration_seconds) }}</span>
            </p>
          </div>
          <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold shrink-0', statusClass(job.status)]">
            {{ statusLabel(job.status) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JobStatusRow } from '~/composables/useYoutubeMonitoring'

const props = withDefaults(defineProps<{ jobs: JobStatusRow[]; tz?: string }>(), { tz: 'UTC' })

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: props.tz })
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function statusClass(status: string | null): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

function statusLabel(status: string | null): string {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
</script>
