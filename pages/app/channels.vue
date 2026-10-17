<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'
import { scopedChannels } from '~/demo/selectors.mjs'
definePageMeta({ layout: 'workspace' })
const demo = useDemoStore()
const session = useSessionStore()
const channels = computed(() => scopedChannels(demo.data, session.session || {}))
const organizationName = (id: string) => demo.data.organizations.find((organization: any) => organization.id === id)?.name || '—'
const networkName = (id: string) => demo.data.networks.find((network: any) => network.id === id)?.name || '—'
</script>

<template>
  <div class="page-content">
    <div class="page-title-row"><div><span class="page-label">ECOSYSTEM</span><h1>YouTube channels</h1><p>Public channel profiles connected to partner networks within your role's scope.</p></div><NuxtLink class="button button-outline" to="/app/analytics">Open analytics</NuxtLink></div>
    <div class="metric-grid"><div class="metric-panel"><span class="metric-label">Channels in scope</span><strong class="metric-value">{{ channels.length }}</strong><span class="metric-note">Based on current role</span></div><div class="metric-panel"><span class="metric-label">Subscribers shown</span><strong class="metric-value">{{ channels.filter((channel: any) => channel.subscriberCount !== null).length }}</strong><span class="metric-note">Public profile counters</span></div><div class="metric-panel"><span class="metric-label">Lifetime channel views</span><strong class="metric-value">{{ (channels.reduce((sum: number, channel: any) => sum + (channel.totalViews || 0), 0) / 1000000).toFixed(1) }}M</strong><span class="metric-note">Cumulative public counters</span></div></div>
    <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Channel</th><th>Organization</th><th>Partner network</th><th>Subscribers</th><th>Lifetime views</th><th>Videos</th></tr></thead><tbody><tr v-for="channel in channels" :key="channel.id"><td><strong>{{ channel.title }}</strong><div class="secondary-text">{{ channel.handle || "Public handle not included in snapshot" }}</div></td><td>{{ organizationName(channel.organizationId) }}</td><td>{{ networkName(channel.networkId) }}</td><td>{{ channel.subscriberCount?.toLocaleString() || 'Hidden' }}</td><td>{{ channel.totalViews.toLocaleString() }}</td><td>{{ channel.videoCount ?? "Not in source snapshot" }}</td></tr><tr v-if="!channels.length"><td colspan="6" class="empty-state">No channels in this role's scope.</td></tr></tbody></table></div></section>
    <p class="form-hint">Channel names and rounded subscribers/views come from the P2P Labs organization snapshot (October 17, 2026). Per-channel video counts and private YouTube Analytics were not present in that snapshot.</p>
  </div>
</template>
