<template>
  <DashboardLoading v-if="loading" label="Loading Creator Suites…" />
  <section v-else-if="error" class="nx-panel"><div class="nx-panel-heading"><h2>Creator Suites</h2></div><p class="nx-empty" role="status">Reports could not be loaded. Refresh the overview to try again.</p></section>
  <section v-else-if="hasTools" class="nx-panel">
    <div class="nx-panel-heading"><div><h2>Creator Suites</h2><p>Research and reporting across your workspace</p></div><NuxtLink :to="`/app/creator-suites/${data!.tools[0].tool_slug}`" class="nx-text-link">Open tools <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink></div>
    <div class="nx-tool-grid">
      <NuxtLink v-for="tool in data!.tools" :key="tool.tool_slug" :to="`/app/creator-suites/${tool.tool_slug}`" class="nx-tool">
        <span class="nx-metric-label">{{ tool.tool_name }}</span><strong>{{ tool.total.toLocaleString('en-US') }} <small>reports</small></strong>
        <span class="nx-tool-status"><span v-if="tool.processing > 0" class="nx-info-text">{{ tool.processing }} processing</span><span v-if="tool.failed > 0" class="nx-danger-text">{{ tool.failed }} failed</span><span v-if="tool.processing === 0 && tool.failed === 0" class="nx-muted">No jobs in progress</span></span>
      </NuxtLink>
    </div>
    <div v-if="data!.recent_reports.length" class="nx-report-list">
      <h3>Recent reports</h3>
      <NuxtLink v-for="report in data!.recent_reports" :key="report.id" :to="`/app/creator-suites/${report.tool_slug}/${report.id}`" class="nx-report-row">
        <div class="nx-report-identity"><img v-if="report.thumbnail_url && !failedAvatars.has(report.id)" :src="report.thumbnail_url" alt="" class="nx-report-avatar" loading="lazy" @error="failedAvatars.add(report.id)" /><span v-else class="nx-report-avatar nx-report-avatar-fallback" aria-hidden="true"><FileText :size="15" /></span><div class="nx-report-copy"><strong>{{ report.title }}</strong><p>{{ report.tool_name }} · {{ formatTimestamp(report.created_at) }}</p></div></div><span :class="statusBadgeClass(report.status)">{{ statusLabel(report.status) }}</span>
      </NuxtLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { CreatorSuitesSummaryData } from '~/composables/useCreatorSuitesSummary'

import { ArrowUpRight, FileText } from 'lucide-vue-next'
import DashboardLoading from './DashboardLoading.vue'

const failedAvatars = ref(new Set<string>())
const props = defineProps<{
  data: CreatorSuitesSummaryData | null
  loading: boolean
  error?: string | null
}>()

const hasTools = computed(() => !!props.data && props.data.tools.length > 0)

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }
  return map[status] || status
}

const statusBadgeClass = (status: string) => {
  const base = 'nx-badge'
  const map: Record<string, string> = {
    completed: 'nx-badge-success',
    processing: 'nx-badge-info',
    pending: 'nx-badge-warning',
    failed: 'nx-badge-danger',
  }
  return `${base} ${map[status] || ''}`
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
</script>
