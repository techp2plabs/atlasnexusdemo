<template>
  <div class="nx-stack">
    <DashboardLoading v-if="loading" />
    <template v-else-if="data">
      <section class="nx-panel"><DashboardMetricStrip :metrics="metrics" label="Organization metrics" /></section>
      <div class="nx-two-column">
        <section class="nx-panel">
          <div class="nx-panel-heading"><div><h2>Partner network portfolio</h2><p>{{ data.org.name }}</p></div><NuxtLink to="/app/mcns" class="nx-text-link">View networks <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink></div>
          <p v-if="!data.mcn_breakdown.length" class="nx-empty">Add a partner network to begin building your portfolio.</p>
          <div v-else class="nx-table-scroll" tabindex="0" role="region" aria-label="Partner network portfolio">
            <table class="nx-table">
              <thead><tr><th scope="col">Partner network</th><th scope="col" class="nx-number">Channels</th><th scope="col" class="nx-number">Creators</th><th scope="col" class="nx-number">Contracts</th><th scope="col" class="nx-number">Est. monthly revenue · USD</th></tr></thead>
              <tbody><tr v-for="mcn in data.mcn_breakdown" :key="mcn.mcn_id">
                <td><NuxtLink :to="`/app/mcns/${mcn.mcn_id}`" class="nx-entity-link">{{ mcn.mcn_name }}</NuxtLink></td>
                <td class="nx-number">{{ mcn.channel_count }}</td><td class="nx-number">{{ mcn.creator_count }}</td><td class="nx-number">{{ mcn.active_contracts }}</td>
                <td class="nx-number">{{ mcn.estimated_monthly_revenue_usd == null ? '—' : formatCurrency(mcn.estimated_monthly_revenue_usd) }}</td>
              </tr></tbody>
            </table>
          </div>
          <p class="nx-panel-note">Estimated revenue is aggregated by Atlas from each network's channel-level YouTube estimates. Unavailable amounts are shown as —.</p>
        </section>
        <section class="nx-panel">
          <div class="nx-panel-heading"><div><h2>Contract watch</h2><p>Agreements across your organization</p></div><FileCheck2 :size="18" class="nx-muted" aria-hidden="true" /></div>
          <dl class="nx-ledger">
            <div><dt>Active contracts</dt><dd>{{ data.counts.active_contracts }}</dd></div>
            <div><dt>Expiring within 30 days</dt><dd :class="{ 'nx-warning-text': data.counts.expiring_contracts_30d > 0 }">{{ data.counts.expiring_contracts_30d }}</dd></div>
            <div><dt>Expired contracts</dt><dd :class="{ 'nx-danger-text': data.counts.expired_contracts > 0 }">{{ data.counts.expired_contracts }}</dd></div>
          </dl>
          <div class="nx-panel-footer"><NuxtLink to="/app/contracts" class="nx-text-link">Review contracts <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink></div>
        </section>
      </div>
      <DashboardSnapshot v-if="data.analytics_snapshot" :snapshot="data.analytics_snapshot" analytics-link="/app/analytics" />
      <div class="nx-command-bar"><span class="nx-muted">Manage your organization</span><div class="nx-button-group">
        <button class="nx-button nx-button-primary" type="button" @click="emit('add-mcn')"><Plus :size="16" aria-hidden="true" /> Add partner network</button>
        <button class="nx-button" type="button" @click="emit('sync-channels')">Sync channels</button>
        <button class="nx-button" type="button" @click="emit('create-user')">Create user</button>
      </div></div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ArrowUpRight, FileCheck2, Plus } from 'lucide-vue-next'
import type { OrgOverviewData } from '~/composables/useDashboardOrg'
import DashboardMetricStrip from './DashboardMetricStrip.vue'
import DashboardLoading from './DashboardLoading.vue'
import DashboardSnapshot from './DashboardSnapshot.vue'
const props = defineProps<{ data: OrgOverviewData | null; loading: boolean }>()
const emit = defineEmits<{ 'add-mcn': []; 'sync-channels': []; 'create-user': [] }>()
const metrics = computed(() => [
  { label: 'Partner networks', value: props.data?.counts.mcns, hint: 'Within your organization' },
  { label: 'Channels', value: props.data?.counts.channels, hint: 'Managed portfolio' },
  { label: 'Creators', value: props.data?.counts.creator_users, hint: 'Creator accounts' },
  { label: 'Active contracts', value: props.data?.counts.active_contracts, to: '/app/contracts', hint: 'Current agreements' },
])
const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
</script>
