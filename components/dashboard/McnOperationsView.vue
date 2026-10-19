<template>
  <div class="nx-stack">
    <DashboardLoading v-if="loading" />
    <template v-else-if="data">
      <div v-if="data.mcns.length > 1" class="nx-network-filter" role="group" aria-label="Partner network scope">
        <button type="button" class="nx-filter" :aria-pressed="selectedMcnId === null" @click="selectedMcnId = null">All partner networks</button>
        <button v-for="mcn in data.mcns" :key="mcn.mcn_id" type="button" class="nx-filter" :aria-pressed="selectedMcnId === mcn.mcn_id" @click="selectedMcnId = mcn.mcn_id">{{ mcn.mcn_name }}</button>
      </div>
      <section class="nx-panel"><DashboardMetricStrip :metrics="metrics" label="Network operations metrics" /></section>
      <TopChannelsTable :channels="activeTopChannels" detail-base="/app/analytics/channels" />
      <div v-if="data.analytics_snapshot" class="nx-stack nx-stack-tight">
        <p v-if="activeMcn" class="nx-scope-note"><Info :size="16" aria-hidden="true" /> The performance snapshot below covers all your accessible partner networks.</p>
        <DashboardSnapshot :snapshot="data.analytics_snapshot" analytics-link="/app/analytics" />
      </div>
      <div class="nx-command-bar"><span class="nx-muted">Network operations</span><div class="nx-button-group">
        <button type="button" class="nx-button nx-button-primary" @click="emit('sync-channels')"><RefreshCw :size="16" aria-hidden="true" /> Sync channels</button>
        <button type="button" class="nx-button" @click="emit('invite-creator')">Invite creator</button>
        <NuxtLink to="/app/contracts" class="nx-button">View contracts</NuxtLink>
      </div></div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { Info, RefreshCw } from 'lucide-vue-next'
import type { McnOverviewData } from '~/composables/useDashboardMcn'
import DashboardMetricStrip from './DashboardMetricStrip.vue'
import DashboardLoading from './DashboardLoading.vue'
import DashboardSnapshot from './DashboardSnapshot.vue'
import TopChannelsTable from './TopChannelsTable.vue'
const props = defineProps<{ data: McnOverviewData | null; loading: boolean }>()
const emit = defineEmits<{ 'sync-channels': []; 'invite-creator': [] }>()
const selectedMcnId = ref<string | null>(null)
const activeMcn = computed(() => selectedMcnId.value ? props.data?.mcns.find(m => m.mcn_id === selectedMcnId.value) ?? null : null)
const activeTotals = computed(() => {
  if (activeMcn.value) return { channels: activeMcn.value.channel_count, creators: activeMcn.value.creator_count, pending_invitations: activeMcn.value.pending_invitations, active_contracts: activeMcn.value.active_contracts }
  return props.data?.totals
})
const activeTopChannels = computed(() => {
  if (!props.data) return []
  if (activeMcn.value) return activeMcn.value.top_channels
  return props.data.mcns.flatMap(m => m.top_channels).sort((a, b) => b.subscriber_count - a.subscriber_count).slice(0, 3)
})
const metrics = computed(() => [
  { label: 'Channels', value: activeTotals.value?.channels, hint: activeMcn.value?.mcn_name || 'All accessible networks' },
  { label: 'Creators', value: activeTotals.value?.creators, hint: 'Creator accounts' },
  { label: 'Pending invitations', value: activeTotals.value?.pending_invitations, hint: 'Awaiting acceptance', warning: (activeTotals.value?.pending_invitations ?? 0) > 0 },
  { label: 'Active contracts', value: activeTotals.value?.active_contracts, hint: 'Current agreements', to: '/app/contracts' },
])
watch(() => props.data, data => { if (selectedMcnId.value && !data?.mcns.some(m => m.mcn_id === selectedMcnId.value)) selectedMcnId.value = null })
</script>
