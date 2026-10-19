<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Sync Run</h3>
        <div v-if="status?.last_run" class="mt-1 flex items-center gap-2">
          <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', statusClass(status.last_run.status)]">
            {{ statusLabel(status.last_run.status) }}
          </span>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            {{ status.last_run.completed_at ? formatDateTime(status.last_run.completed_at) : formatDateTime(status.last_run.started_at) }}
          </span>
        </div>
        <p v-else class="mt-1 text-sm text-gray-400 dark:text-gray-500">No runs recorded yet</p>
      </div>

      <div class="text-right">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Stale Channels</h3>
        <p
          class="mt-1 text-lg font-bold"
          :class="staleCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'"
        >
          {{ staleCount }} / {{ status?.total_channels_tracked ?? 0 }}
        </p>
      </div>
    </div>

    <div v-if="staleCount > 0" class="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
      <p class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        Channels not synced in over 12 hours:
      </p>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="ch in status!.stale_channels.slice(0, 12)"
          :key="ch.channel_id"
          class="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          :title="`Last synced: ${formatDateTime(ch.last_fetched_at)}`"
        >
          {{ ch.channel_id }} · {{ Math.round(ch.hours_stale) }}h
        </span>
        <span v-if="status!.stale_channels.length > 12" class="text-xs text-gray-400 dark:text-gray-500">
          +{{ status!.stale_channels.length - 12 }} more
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyticsSyncStatus } from '~/composables/useAnalyticsSync'

const props = defineProps<{ status: AnalyticsSyncStatus | null }>()

const staleCount = computed(() => props.status?.stale_channels.length ?? 0)

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
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
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
</script>
