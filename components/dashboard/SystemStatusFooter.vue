<template>
  <footer class="nx-system-status">
    <div><span class="nx-status-dot" :class="dotClass" aria-hidden="true" /><span>{{ statusLabel }}</span><NuxtLink v-if="syncHealth" to="/app/settings/youtube-api?tab=analytics-sync" class="nx-text-link">Sync details</NuxtLink></div>
    <div><span>Overview fetched: {{ lastUpdatedLabel }}</span><button type="button" class="nx-icon-button" :disabled="refreshing" aria-label="Refresh overview" @click="emit('refresh')"><RefreshCw :size="14" aria-hidden="true" /></button></div>
  </footer>
</template>
<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import type { SyncHealthSummary } from '~/composables/usePlatformOverview'

interface Props {
  refreshing?: boolean
  lastUpdated?: Date | null
  syncHealth?: SyncHealthSummary | null
}

const props = withDefaults(defineProps<Props>(), {
  lastUpdated: null,
  refreshing: false,
  syncHealth: null,
})

const emit = defineEmits<{
  refresh: []
}>()

const lastUpdatedLabel = computed(() => {
  const date = props.lastUpdated
  if (!date) return 'Not available'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

// Green when the last analytics sync run succeeded and nothing is stale; amber for
// partial failures or stale channels; red when the run failed outright; gray when
// no sync data is available yet (e.g. sync_health couldn't be computed).
const dotColor = computed<'success' | 'warning' | 'error' | 'neutral'>(() => {
  const health = props.syncHealth
  if (!health) return 'neutral'
  if (health.status === 'failed') return 'error'
  if (health.status === 'partial_failure' || health.stale_channel_count > 0) return 'warning'
  if (health.status === 'success') return 'success'
  return 'neutral'
})

const dotClass = computed(() => ({
  success: 'nx-dot-success',
  warning: 'nx-dot-warning',
  error: 'nx-dot-danger',
  neutral: 'nx-dot-neutral',
}[dotColor.value]))

const statusLabel = computed(() => {
  const health = props.syncHealth
  if (!health) return 'Sync status unavailable'
  if (health.status === 'failed') return 'Analytics sync failed — needs attention'
  if (health.status === 'partial_failure') return 'Analytics sync partially failed'
  if (health.stale_channel_count > 0) return `${health.stale_channel_count} channel${health.stale_channel_count > 1 ? 's' : ''} stale`
  if (health.status === 'success') return 'Analytics sync up to date'
  if (health.status === 'running') return 'Analytics sync in progress'
  return 'Sync status unknown'
})
</script>
