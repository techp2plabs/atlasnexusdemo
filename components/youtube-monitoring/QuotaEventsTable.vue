<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="px-5 py-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Quota-Exceeded Events</h3>
    </div>
    <div v-if="!events.length" class="px-5 pb-5 text-sm text-gray-400 dark:text-gray-500">
      No quota errors today
    </div>
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-100 dark:border-gray-800">
          <th class="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Time</th>
          <th class="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Service</th>
          <th class="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Operation</th>
          <th class="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Module</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
        <tr v-for="(evt, i) in events" :key="i" class="hover:bg-gray-50 dark:hover:bg-gray-800/30">
          <td class="px-5 py-3 text-gray-600 dark:text-gray-300">{{ formatTime(evt.timestamp) }}</td>
          <td class="px-5 py-3">
            <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">{{ evt.service }}</span>
          </td>
          <td class="px-5 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{{ evt.operation }}</td>
          <td class="px-5 py-3 text-gray-600 dark:text-gray-400">{{ evt.module }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { QuotaEventRow } from '~/composables/useYoutubeMonitoring'

const props = withDefaults(defineProps<{ events: QuotaEventRow[]; tz?: string }>(), { tz: 'UTC' })

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: props.tz })
}
</script>
