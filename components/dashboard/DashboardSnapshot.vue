<template>
  <section class="nx-panel">
    <div class="nx-panel-heading">
      <div><h2>Performance snapshot</h2><p>Last {{ snapshot.period_days }} days · Data through {{ snapshot.data_as_of }}</p></div>
      <NuxtLink v-if="analyticsLink" :to="analyticsLink" class="nx-text-link">View analytics <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink>
    </div>
    <DashboardMetricStrip :metrics="metrics" label="Performance metrics" />
    <p class="nx-panel-note">Estimated revenue in USD, aggregated by Atlas from channel-level YouTube estimates. This is not a contract allocation or a finalized payout.</p>
  </section>
</template>
<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { AnalyticsSnapshot } from '~/composables/useDashboardOrg'
import DashboardMetricStrip from './DashboardMetricStrip.vue'
const props = defineProps<{ snapshot: AnalyticsSnapshot; analyticsLink?: string }>()
const number = (value: number | null | undefined) => value == null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
const metrics = computed(() => [
  { label: 'Views', value: number(props.snapshot.total_views) },
  { label: 'Watch time', value: number(props.snapshot.total_watch_time_hours), hint: 'Hours watched' },
  { label: 'Net subscribers', value: number(props.snapshot.subscribers_net), hint: 'Gained minus lost' },
  { label: 'Est. revenue · USD', value: props.snapshot.estimated_revenue_usd == null ? '—' : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(props.snapshot.estimated_revenue_usd), hint: props.snapshot.estimated_revenue_usd == null ? 'Revenue unavailable' : 'YouTube estimates' },
])
</script>
