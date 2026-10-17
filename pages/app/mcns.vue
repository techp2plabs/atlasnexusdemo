<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'
import { selectHierarchy } from '~/demo/selectors.mjs'
definePageMeta({ layout: 'workspace' })
const demo = useDemoStore()
const session = useSessionStore()
const networks = computed(() => selectHierarchy(demo.data, session.session || {}).flatMap((organization: any) => organization.networks.map((network: any) => ({ ...network, organization }))))
</script>

<template>
  <div class="page-content">
    <div class="page-title-row"><div><span class="page-label">ECOSYSTEM</span><h1>Partner networks</h1><p>Browse MCNs and creator collectives under organizations in your role's scope.</p></div><NuxtLink class="button button-outline" to="/app/hierarchy">Manage hierarchy</NuxtLink></div>
    <div class="metric-grid"><div class="metric-panel"><span class="metric-label">Partner networks</span><strong class="metric-value">{{ networks.length }}</strong><span class="metric-note">In visible organizations</span></div><div class="metric-panel"><span class="metric-label">Organizations</span><strong class="metric-value">{{ new Set(networks.map((network: any) => network.organizationId)).size }}</strong><span class="metric-note">Parent organizations</span></div><div class="metric-panel"><span class="metric-label">Channels in networks</span><strong class="metric-value">{{ networks.reduce((sum: number, network: any) => sum + network.channels.length, 0) }}</strong><span class="metric-note">Public organization snapshot</span></div></div>
    <section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Partner network</th><th>Organization</th><th>Location</th><th>Channels</th></tr></thead><tbody><tr v-for="network in networks" :key="network.id"><td><strong>{{ network.name }}</strong></td><td>{{ network.organization.name }}</td><td>{{ network.organization.city || "Location not listed" }}</td><td><span v-for="(channel, index) in network.channels" :key="channel.id">{{ index ? ', ' : '' }}{{ channel.title }}</span></td></tr><tr v-if="!networks.length"><td colspan="4" class="empty-state">No partner networks in this role's scope.</td></tr></tbody></table></div></section>
    <p class="form-hint">Hierarchy edits are available in the Network hierarchy view for Super Admin.</p>
  </div>
</template>
