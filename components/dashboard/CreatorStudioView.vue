<template>
  <div class="nx-stack">
    <DashboardLoading v-if="loading" label="Loading your channels…" />
    <template v-else-if="data">
      <section v-if="!data.channels.length" class="nx-panel nx-empty"><Video :size="24" aria-hidden="true" /><h2>No channels assigned yet</h2><p>Your partner network operator can assign channels to your account.</p></section>
      <template v-else>
        <DashboardSnapshot v-if="data.analytics_snapshot" :snapshot="data.analytics_snapshot" />
        <section class="nx-panel">
          <div class="nx-panel-heading"><div><h2>Your channel portfolio</h2><p>Performance access and contract coverage</p></div><span class="nx-badge">{{ data.channels.length }} {{ data.channels.length === 1 ? 'channel' : 'channels' }}</span></div>
          <div class="nx-creator-channels">
            <article v-for="ch in data.channels" :key="ch.channel_id" class="nx-creator-row">
              <div class="nx-entity-link"><img v-if="ch.thumbnail_url && !failedAvatars.has(ch.channel_id)" :src="ch.thumbnail_url" alt="" class="nx-avatar" @error="failedAvatars.add(ch.channel_id)" /><span v-else class="nx-avatar nx-avatar-fallback" aria-hidden="true"><Video :size="16" /></span><div><strong>{{ ch.channel_name }}</strong><p class="nx-muted">{{ formatCompact(ch.subscriber_count) }} subscribers</p></div></div>
              <div><span class="nx-badge" :class="ch.contract ? contractBadgeClass(ch.contract.status) : ''">{{ ch.contract ? contractBadgeLabel(ch.contract.status) : 'No contract' }}</span><p v-if="ch.contract" class="nx-muted">Your share: {{ ch.contract.revenue_share_pct }}%</p></div>
              <div class="nx-button-group"><a :href="`https://studio.youtube.com/channel/${ch.youtube_channel_id}`" target="_blank" rel="noopener noreferrer" class="nx-text-link">YouTube Studio <ExternalLink :size="14" aria-hidden="true" /></a><NuxtLink :to="`/app/analytics/channels/${ch.channel_id}`" class="nx-button">View analytics</NuxtLink></div>
            </article>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ExternalLink, Video } from 'lucide-vue-next'
import type { CreatorOverviewData } from '~/composables/useDashboardCreator'
import DashboardLoading from './DashboardLoading.vue'
import DashboardSnapshot from './DashboardSnapshot.vue'
const failedAvatars = ref(new Set<string>())
defineProps<{ data: CreatorOverviewData | null; loading: boolean }>()
const contractBadgeClass = (status: string) => (({ active: 'nx-badge-success', expiring_soon: 'nx-badge-warning', expired: 'nx-badge-danger' } as Record<string, string>)[status] || '')
const contractBadgeLabel = (status: string) => (({ active: 'Active', expiring_soon: 'Expiring soon', expired: 'Expired' } as Record<string, string>)[status] || status.replace(/_/g, ' '))
const formatCompact = (n: number | null | undefined) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
</script>
