<script setup lang="ts">
import { useDemoStore } from '~/stores/demo'
import { useSessionStore } from '~/stores/session'
import { selectHierarchy } from '~/demo/selectors.mjs'
definePageMeta({ layout: 'workspace' })
const demo = useDemoStore()
const session = useSessionStore()
const organizations = computed(() => selectHierarchy(demo.data, session.session || {}))
</script>

<template>
  <div class="page-content">
    <div class="page-title-row"><div><span class="page-label">ECOSYSTEM</span><h1>Organizations</h1><p>Organizations and the partner networks and YouTube channels within your role's scope.</p></div><NuxtLink class="button button-outline" to="/app/hierarchy">Manage hierarchy</NuxtLink></div>
    <div class="metric-grid"><div class="metric-panel"><span class="metric-label">Organizations in scope</span><strong class="metric-value">{{ organizations.length }}</strong><span class="metric-note">Based on current role</span></div><div class="metric-panel"><span class="metric-label">Partner networks</span><strong class="metric-value">{{ organizations.reduce((sum, org) => sum + org.networks.length, 0) }}</strong><span class="metric-note">Nested under organizations</span></div><div class="metric-panel"><span class="metric-label">YouTube channels</span><strong class="metric-value">{{ organizations.reduce((sum, org) => sum + org.networks.reduce((count, network) => count + network.channels.length, 0), 0) }}</strong><span class="metric-note">Public organization snapshot</span></div></div>
    <div class="dashboard-columns"><section v-for="org in organizations" :key="org.id" class="panel"><div class="panel-head"><div><h2>{{ org.name }}</h2><p>{{ org.city || 'Location not listed' }} · {{ org.status }}</p></div><span class="tag">{{ org.networks.length }} networks</span></div><div class="panel-body"><div v-for="network in org.networks" :key="network.id" class="summary-line"><span><strong>{{ network.name }}</strong><small class="secondary-text"> · {{ network.channels.length }} channels</small></span><NuxtLink class="flow-link" to="/app/mcns">View networks →</NuxtLink></div><p v-if="!org.networks.length" class="empty-state">No partner networks in this organization yet.</p></div></section></div>
    <p class="form-hint">P2P Labs organization snapshot from Atlas Nexus (October 17, 2026): 40 listed channels, 3 partner networks, 10 active contracts. K/M channel counters are rounded. Local demo changes stay in this browser.</p>
  </div>
</template>
