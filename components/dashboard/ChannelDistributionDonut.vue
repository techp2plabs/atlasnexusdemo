<template>
  <section class="nx-panel nx-fill">
    <div class="nx-panel-heading"><div><h2>Channel distribution</h2><p>Channels by partner network</p></div></div>
    <p v-if="total === 0" class="nx-empty">No channel distribution available yet.</p>
    <div v-else class="nx-donut-layout">
      <div class="nx-donut" :style="{ background: gradient }" role="img" :aria-label="`${total.toLocaleString('en-US')} channels across ${distribution.length} partner networks; breakdown listed alongside`"><div><strong>{{ total.toLocaleString('en-US') }}</strong><span>Channels</span></div></div>
      <div class="nx-donut-details"><ul><li v-for="(item,index) in distribution" :key="`${item.label}-${index}`"><i :style="{ background: colors[index % colors.length] }" aria-hidden="true" /><span>{{ item.label }}</span><strong>{{ item.channel_count.toLocaleString('en-US') }}</strong><small>{{ (item.channel_count / total * 100).toFixed(1) }}%</small></li></ul><p class="nx-distribution-note">{{ total.toLocaleString('en-US') }} channels represented<br /><span>Across {{ distribution.length }} partner networks</span></p></div>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { ChannelDistributionItem } from '~/composables/usePlatformOverview'
const props = defineProps<{ distribution: ChannelDistributionItem[] }>()
const colors = ['var(--nx-action)', '#2563eb', '#b45309', '#0f766e', '#a578d8', 'var(--nx-muted)']
const total = computed(() => props.distribution.reduce((sum, item) => sum + item.channel_count, 0))
const gradient = computed(() => {
  let start = 0
  return `conic-gradient(${props.distribution.map((item,index) => { const end = start + item.channel_count / total.value * 100; const segment = `${colors[index % colors.length]} ${start}% ${end}%`; start = end; return segment }).join(', ')})`
})
</script>
