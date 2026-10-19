<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Run History</h3>

    <div v-if="!runs.length" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
      No runs recorded
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800 dark:text-gray-500">
            <th class="py-2 pr-3 font-medium">Started</th>
            <th class="py-2 pr-3 font-medium">Duration</th>
            <th class="py-2 pr-3 font-medium">Trigger</th>
            <th class="py-2 pr-3 font-medium">Status</th>
            <th class="py-2 pr-3 font-medium">Channels</th>
            <th class="py-2 pr-3 font-medium">Rows</th>
            <th class="py-2 pr-3 font-medium"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="run in runs" :key="run.id">
            <td class="py-2.5 pr-3 text-gray-700 dark:text-gray-300">{{ formatDateTime(run.started_at) }}</td>
            <td class="py-2.5 pr-3 text-gray-500 dark:text-gray-400">{{ formatDuration(run.duration_seconds) }}</td>
            <td class="py-2.5 pr-3">
              <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', triggerClass(run.trigger_source)]">
                {{ triggerLabel(run.trigger_source) }}
              </span>
            </td>
            <td class="py-2.5 pr-3">
              <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', statusClass(run.status)]">
                {{ statusLabel(run.status) }}
              </span>
            </td>
            <td class="py-2.5 pr-3 text-gray-500 dark:text-gray-400">
              {{ run.channels_ok }} ok<span v-if="run.channels_failed"> / {{ run.channels_failed }} failed</span>
              / {{ run.channels_total }} total
            </td>
            <td class="py-2.5 pr-3 text-gray-500 dark:text-gray-400">{{ run.persisted_rows }}</td>
            <td class="py-2.5 pr-3 text-right">
              <button
                v-if="canRetry(run)"
                :disabled="retryingId === run.id"
                @click="handleRetry(run)"
                class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {{ retryingId === run.id ? 'Retrying…' : 'Retry' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnalyticsSyncRunItem } from '~/composables/useAnalyticsSync'

const props = defineProps<{ runs: AnalyticsSyncRunItem[] }>()
const emit = defineEmits<{ retry: [runId: string] }>()

const retryingId = ref<string | null>(null)

function canRetry(run: AnalyticsSyncRunItem): boolean {
  return (run.status === 'partial_failure' || run.status === 'failed') && !run.has_retry
}

function handleRetry(run: AnalyticsSyncRunItem) {
  const channelIds = Object.keys(run.failure_details || {})
  const confirmed = window.confirm(
    channelIds.length
      ? `Retry sync for ${channelIds.length} failed channel(s): ${channelIds.slice(0, 5).join(', ')}${channelIds.length > 5 ? '…' : ''}?`
      : 'Retry this run?'
  )
  if (!confirmed) return
  retryingId.value = run.id
  emit('retry', run.id)
}

defineExpose({ clearRetrying: () => { retryingId.value = null } })

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

function statusClass(status: string): string {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'partial_failure': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

function statusLabel(status: string): string {
  return status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function triggerClass(source: string): string {
  switch (source) {
    case 'scheduled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    case 'manual': return 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
    case 'retry': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

function triggerLabel(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1)
}
</script>
