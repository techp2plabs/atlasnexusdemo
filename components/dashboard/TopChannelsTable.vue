<template>
  <section class="nx-panel nx-fill">
    <div class="nx-panel-heading">
      <div><h2>Channel leaders</h2><p>Subscriber reach and views over the last 30 days</p></div>
      <NuxtLink to="/app/channels" class="nx-text-link">All channels <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink>
    </div>
    <p v-if="channels.length === 0" class="nx-empty">No channel data available yet.</p>
    <div v-else class="nx-table-scroll" tabindex="0" role="region" aria-label="Channel leaders">
      <table class="nx-table">
        <thead><tr><th scope="col">#</th><th scope="col">Channel</th><th scope="col" class="nx-number">Subscribers</th><th scope="col" class="nx-number">Views · 30d</th></tr></thead>
        <tbody><tr v-for="(ch, index) in channels" :key="ch.channel_id">
          <td class="nx-muted">{{ index + 1 }}</td><td><NuxtLink :to="`${detailBase}/${ch.channel_id}`" class="nx-entity-link">
            <img v-if="ch.thumbnail_url && !failedAvatars.has(ch.channel_id)" :src="ch.thumbnail_url" alt="" class="nx-avatar" loading="lazy" @error="failedAvatars.add(ch.channel_id)" />
            <span v-else class="nx-avatar nx-avatar-fallback" aria-hidden="true"><Video :size="16" /></span>
            <span>{{ ch.channel_name }}</span>
          </NuxtLink></td>
          <td class="nx-number" :title="exact(ch.subscriber_count)">{{ formatCompact(ch.subscriber_count) }}</td>
          <td class="nx-number" :title="exact(ch.views_30d)">{{ formatCompact(ch.views_30d) }}</td>
        </tr></tbody>
      </table>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ArrowUpRight, Video } from 'lucide-vue-next'
import type { PlatformTopChannelItem } from '~/composables/usePlatformOverview'
const failedAvatars = ref(new Set<string>())
withDefaults(defineProps<{ channels: PlatformTopChannelItem[]; detailBase?: string }>(), { detailBase: '/app/channels' })
const formatCompact = (n: number | null | undefined) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const exact = (n: number | null | undefined) => n == null ? 'Unavailable' : n.toLocaleString('en-US')
</script>
