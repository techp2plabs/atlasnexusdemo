<template>
  <section class="nx-panel">
    <div class="nx-panel-heading"><div><h2>Explore your ecosystem</h2><p>Recently updated entities from the loaded directory</p></div></div>
    <div class="nx-directory-grid">
      <section v-for="group in groups" :key="group.label" class="nx-directory-group">
        <div class="nx-directory-heading"><h3>{{ group.label }}</h3><NuxtLink :to="group.to" class="nx-text-link" :aria-label="`View all ${group.label.toLowerCase()}`">View all <ArrowUpRight :size="14" aria-hidden="true" /></NuxtLink></div>
        <p v-if="!group.items.length" class="nx-empty">No records to show.</p>
        <NuxtLink v-for="item in group.items" :key="item.id" :to="`${group.to}/${item.id}`" class="nx-directory-row">
          <img v-if="item.thumbnail_url && !failedAvatars.has(item.id)" :src="item.thumbnail_url" alt="" class="nx-directory-avatar" loading="lazy" @error="failedAvatars.add(item.id)" />
          <span v-else class="nx-directory-mark" aria-hidden="true">{{ item.name.slice(0, 1).toUpperCase() }}</span>
          <span class="nx-directory-copy"><strong>{{ item.name }}</strong><small>{{ item.detail }}</small></span>
          <ChevronRight :size="14" class="nx-muted" aria-hidden="true" />
        </NuxtLink>
      </section>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ArrowUpRight, ChevronRight } from 'lucide-vue-next'
import type { Organization } from '~/types/organization'
import type { MCN } from '~/types/mcn'
const failedAvatars = ref(new Set<string>())
const props = defineProps<{ organizations: Organization[]; mcns: MCN[]; channels: any[] }>()
const count = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('en-US')
const groups = computed(() => [
  { label: 'Organizations', to: '/app/organizations', items: props.organizations.map(o => ({ id: o.id, name: o.name, detail: `${count(o.mcn_count)} networks · ${count(o.channel_count)} channels` })) },
  { label: 'Partner networks', to: '/app/mcns', items: props.mcns.map(m => ({ id: m.id, name: m.name, detail: `${m.organization_name || 'Organization unavailable'} · ${count(m.channel_count)} channels` })) },
  { label: 'Channels', to: '/app/channels', items: props.channels.map(c => ({ id: c.id, name: c.title || c.name || 'Channel', detail: `${count(c.subscriber_count)} subscribers`, thumbnail_url: c.thumbnail_url || null })) },
])
</script>
