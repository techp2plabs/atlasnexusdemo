<template>
  <section class="nx-panel">
    <div class="nx-panel-heading"><div><h2>Recent activity</h2><p>Changes within your accessible workspace</p></div></div>
    <p v-if="loading" class="nx-empty" role="status">Loading activity…</p>
    <p v-else-if="error" class="nx-empty" role="status">Activity could not be loaded. Refresh the overview to try again.</p>
    <p v-else-if="activities.length === 0" class="nx-empty">No recent activity to show.</p>
    <ol v-else class="nx-activity-list"><li v-for="activity in activities" :key="activity.id"><span class="nx-activity-dot" aria-hidden="true" /><div><p>{{ describeAction(activity) }}</p><time :datetime="activity.created_at">{{ formatTimestamp(activity.created_at) }}</time></div></li></ol>
  </section>
</template>
<script setup lang="ts">
import type { ActivityLogItem } from '~/composables/useDashboardActivity'

interface Props {
  activities: ActivityLogItem[]
  loading?: boolean
  error?: string | null
}

defineProps<Props>()

const ACTION_LABELS: Record<string, string> = {
  user_created_direct: 'created a new user',
}

const describeAction = (activity: ActivityLogItem) => {
  const actor = activity.actor_name || 'Someone'
  const label = ACTION_LABELS[activity.action] || activity.action.replace(/_/g, ' ')
  return `${actor} ${label}`
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}
</script>
