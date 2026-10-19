<template>
  <section class="nx-panel nx-fill">
    <div class="nx-panel-heading"><div><h2>Needs your attention</h2><p>Items requiring action across the platform</p></div></div>
    <ul class="nx-attention-list">
      <li><span class="nx-attention-icon"><Users :size="18" aria-hidden="true" /></span><span>{{ counts.pending_verifications ? `${counts.pending_verifications.toLocaleString('en-US')} users awaiting verification` : 'No users awaiting verification' }}</span><NuxtLink :to="counts.pending_verifications ? '/app/users?status=pending_verification' : '/app/users'" class="nx-text-link">Review users <ArrowRight :size="14" aria-hidden="true" /></NuxtLink></li>
      <li><span class="nx-attention-icon nx-attention-amber"><FileText :size="18" aria-hidden="true" /></span><span>{{ expiring30d.toLocaleString('en-US') }} contracts expiring within 30 days</span><NuxtLink to="/app/contracts" class="nx-text-link">View contracts <ArrowRight :size="14" aria-hidden="true" /></NuxtLink></li>
      <li><span class="nx-attention-icon"><RefreshCw :size="18" aria-hidden="true" /></span><span>{{ syncHealth == null ? 'Channel sync status unavailable' : `${syncHealth.stale_channel_count.toLocaleString('en-US')} channels with stale sync data` }}</span><NuxtLink to="/app/channels" class="nx-text-link">View channels <ArrowRight :size="14" aria-hidden="true" /></NuxtLink></li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { ArrowRight, FileText, RefreshCw, Users } from 'lucide-vue-next'
import type { PlatformCounts, SyncHealthSummary } from '~/composables/usePlatformOverview'
defineProps<{ counts: PlatformCounts; expiring30d: number; syncHealth: SyncHealthSummary | null }>()
</script>
