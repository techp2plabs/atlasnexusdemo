<template>
  <section aria-label="Platform overview" class="nx-overview-strip">
    <DashboardMetricStrip :metrics="metrics" />
    <div class="nx-strip-footer">
      <span>Organization → Partner network → Channel</span>
      <NuxtLink to="/app/users" class="nx-text-link">{{ pendingInvitationsTotal == null ? 'Invitations unavailable' : `${pendingInvitationsTotal.toLocaleString('en-US')} pending invitations` }} <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { PlatformCounts } from '~/composables/usePlatformOverview'
import DashboardMetricStrip from './DashboardMetricStrip.vue'
const props = defineProps<{ counts: PlatformCounts; pendingInvitationsTotal?: number }>()
const metrics = computed(() => [
  { label: 'Organizations', value: props.counts.total_organizations, hint: `${props.counts.active_organizations} active`, to: '/app/organizations' },
  { label: 'Partner networks', value: props.counts.total_mcns, hint: `${props.counts.active_mcns} active`, to: '/app/mcns' },
  { label: 'Channels', value: props.counts.total_channels, hint: 'Across the platform', to: '/app/channels' },
  { label: 'Users', value: props.counts.total_users, hint: props.counts.pending_verifications > 0 ? `${props.counts.pending_verifications} awaiting verification` : 'No pending verifications', warning: props.counts.pending_verifications > 0, to: '/app/users' },
])
</script>
